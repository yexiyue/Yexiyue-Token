// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;
import "./YexiyueToken.sol";

contract Exchange {
    address public feeAccount;
    uint256 public feePercent;

    address constant ETHER = address(0);

    mapping(address => mapping(address => uint256)) public tokens;

    event Deposit(
        address indexed token,
        address indexed user,
        uint256 amount,
        uint256 balance
    );

    event Withdraw(
        address indexed token,
        address indexed user,
        uint256 amount,
        uint256 balance
    );

    struct Token {
        address token;
        uint256 amount;
    }

    struct _Order {
        uint256 id;
        address user;
        Token getToken;
        Token giveToken;
        uint256 timestamp;
    }
    // 保存订单
    mapping(uint256 => _Order) public orders;

    uint256 public orderCount;
    // 保存取消的订单
    mapping(uint256 => bool) public orderCancel;
    // 保存完成的订单
    mapping(uint256 => bool) public orderFill;

    event Order(
        uint256 indexed id,
        address indexed user,
        Token getToken,
        Token giveToken,
        uint256 timestamp
    );

    event Cancel(
        uint256 indexed id,
        address indexed user,
        Token getToken,
        Token giveToken,
        uint256 timestamp
    );

    event Trade(
        uint256 indexed id,
        address indexed user,
        Token getToken,
        Token giveToken,
        uint256 timestamp
    );

    constructor(address _feeAccount, uint256 _feePercent) payable {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    function depositToken(address _token, uint256 _amount) public {
        require(_token != ETHER);
        require(_amount > 0, "Amount must be greater than 0");
        require(
            YexiyueToken(_token).transferFrom(
                msg.sender,
                address(this),
                _amount
            )
        );

        tokens[_token][msg.sender] += _amount;
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    function depositEther() public payable {
        tokens[ETHER][msg.sender] += msg.value;
        emit Deposit(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);
    }

    function withdrawEther(uint256 _amount) public {
        require(tokens[ETHER][msg.sender] >= _amount);

        tokens[ETHER][msg.sender] -= _amount;
        payable(msg.sender).transfer(_amount);

        emit Withdraw(ETHER, msg.sender, _amount, tokens[ETHER][msg.sender]);
    }

    function withdraw(address _token, uint256 _amount) public {
        require(_token != ETHER);
        require(tokens[_token][msg.sender] >= _amount, "Insufficient balance");

        require(YexiyueToken(_token).transfer(msg.sender, _amount));
        tokens[_token][msg.sender] -= _amount;

        emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    function balanceOf(
        address _token,
        address _user
    ) public view returns (uint256) {
        return tokens[_token][_user];
    }

    function makeOrder(Token memory getToken, Token memory giveToken) public {
        require(
            tokens[giveToken.token][msg.sender] >= giveToken.amount,
            "You don't have enough tokens"
        );
        orderCount += 1;
        orders[orderCount] = _Order(
            orderCount,
            msg.sender,
            getToken,
            giveToken,
            block.timestamp
        );

        emit Order(
            orderCount,
            msg.sender,
            getToken,
            giveToken,
            block.timestamp
        );
    }

    function cancelOrder(uint256 _orderId) public {
        _Order memory order = orders[_orderId];
        require(
            order.user == msg.sender,
            "You are not the owner of this order"
        );
        orderCancel[_orderId] = true;
        emit Cancel(
            _orderId,
            msg.sender,
            order.getToken,
            order.giveToken,
            block.timestamp
        );
    }

    function fillOrder(uint256 _orderId) public {
        _Order memory order = orders[_orderId];
        require(order.user != msg.sender);
        require(
            tokens[order.giveToken.token][order.user] >= order.giveToken.amount,
            "Not enough token"
        );
        uint256 feeAmount = (order.getToken.amount * feePercent) / 100;

        require(
            tokens[order.getToken.token][msg.sender] >=
                (order.getToken.amount + feeAmount),
            "Insufficient balance"
        );

        // 购买人支付手续费
        tokens[order.getToken.token][msg.sender] -= (order.getToken.amount +
            feeAmount);
        // 交易所收取手续费
        tokens[order.getToken.token][feeAccount] += feeAmount;
        tokens[order.getToken.token][order.user] += order.getToken.amount;

        tokens[order.giveToken.token][msg.sender] += order.giveToken.amount;
        tokens[order.giveToken.token][order.user] -= order.giveToken.amount;
        orderFill[_orderId] = true;
        emit Trade(
            _orderId,
            order.user,
            order.getToken,
            order.giveToken,
            block.timestamp
        );
    }
}
