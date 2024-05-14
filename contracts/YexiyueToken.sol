// 指定许可证类型，这里是UNLICENSED，意味着无许可协议。
// SPDX-License-Identifier: UNLICENSED

// 设置合约使用Solidity版本，这里使用的是^0.8.24。
pragma solidity ^0.8.24;

// 创建一个名为YexiyueToken的合约。
contract YexiyueToken {
    // 公开变量，储存代币名称。
    string public name = "YexiyueToken";
    // 代币拥有者的地址。
    address public owner;
    // 代币符号。
    string public symbol = "YXT";
    // 小数点精度，这里设置为18位小数。
    uint256 public decimals = 18;
    // 代币总供应量。
    uint256 public totalSupply;
    // 映射每个地址的代币余额。
    mapping(address => uint256) public balanceOf;
    // 映射允许他人从某地址转移代币的额度。
    mapping(address => mapping(address => uint256)) public allowance;

    // 构造函数，初始化代币总供应并分配给合约部署者。
    constructor() payable {
        totalSupply = 1000000 * (10 ** decimals);
        owner = payable(msg.sender);
        balanceOf[msg.sender] = totalSupply;
    }

    // 定义一个Transfer事件，用于记录转账行为。
    event Transfer(address indexed from, address indexed to, uint256 value);

    // 转账函数，允许一个地址向另一个地址转移代币。
    function transfer(address _to, uint256 _value) public returns (bool) {
        _transfer(msg.sender, _to, _value);
        return true;
    }

    // 内部函数，处理实际的代币转移逻辑。
    function _transfer(address _from, address _to, uint256 _value) internal {
        // 检查目标地址和发送地址的有效性，以及发送者余额是否充足。
        require(_to != address(0), "Invalid recipient address");
        require(_from != address(0), "Invalid sender address");
        require(balanceOf[_from] >= _value, "Insufficient balance");

        // 更新余额，并触发Transfer事件。
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(_from, _to, _value);
    }

    // 定义Approval事件，记录代币授权行为。
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    // 授权函数，允许一个地址（_spender）从另一个地址（_owner）提取一定额度的代币。
    function approve(
        address _spender,
        uint256 _value
    ) public returns (bool success) {
        require(_spender != address(0), "Invalid spender address");
        // 要求_value大于0
        require(_value > 0, "Approval value must be greater than 0");

        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    // 根据之前授权，从一个地址转移代币到另一个地址。
    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool success) {
        // 检查转出地址的余额和授权额度是否足够。
        require(balanceOf[_from] >= _value, "Insufficient balance");
        require(
            allowance[_from][msg.sender] >= _value,
            "Insufficient allowance"
        );

        // 减少授权额度并执行转移。
        allowance[_from][msg.sender] -= _value;
        _transfer(_from, _to, _value);
        return true;
    }
}
