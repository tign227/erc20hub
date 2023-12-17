// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "./Token.sol";

contract Exchange {
    // [X] Make order
    // [X] Cancel order
    // [X] Fill order
    // [X] Charge fees
    address public feeAccount;
    uint256 public feePercentage;
    address constant ETHER = address(0);
    //token address => user address => total
    mapping(address => mapping(address => uint256)) public tokens;

    mapping(uint256 => Order) public orders;
    mapping(uint256 => bool) public cancelledOrders;

    //event
    event Deposit(
        address _token,
        address _owner,
        uint256 _amount,
        uint256 _balance
    );

    event Withdraw(
        address _token,
        address _owner,
        uint256 _amount,
        uint256 _balance
    );

    event OrderCreated(
        uint256 _id,
        address _user,
        address _tokenGet,
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive,
        uint256 _timestamp
    );

    event OrderCancelled(
        uint256 _id,
        address _user,
        address _tokenGet,
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive,
        uint256 _timestamp
    );

    //struct
    struct Order {
        uint256 id;
        address user;
        address tokenGet;
        uint256 amountGet;
        address tokenGive;
        uint256 amountGive;
        uint256 timestamp;
    }

    constructor(address _feeAccount, uint _feePercentage) {
        feeAccount = _feeAccount;
        feePercentage = _feePercentage;
    }

    function depositEther() public payable {
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender] + msg.value;
        //balanced of msg.sender will reduce automatically
        emit Deposit(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);
    }

    function withdrawEther(uint256 _amount) public {
        require(tokens[ETHER][msg.sender] >= _amount);
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender] - _amount;
        //transfer Ether from exchange to msg.sender
        payable(msg.sender).transfer(_amount);
        emit Withdraw(ETHER, msg.sender, _amount, tokens[ETHER][msg.sender]);
    }

    function depositToken(address _token, uint256 _amount) public {
        require(_token != ETHER);
        //transfer token to msg.sender and required Approve action
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));
        tokens[_token][msg.sender] = tokens[_token][msg.sender] + _amount;
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    function withdrawToken(address _token, uint256 _amount) public {
        require(_token != ETHER);
        require(tokens[_token][msg.sender] >= _amount);
        tokens[_token][msg.sender] = tokens[_token][msg.sender] - _amount;
        //trasfer action is enough
        require(Token(_token).transfer(msg.sender, _amount));
        emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    function balanceOf(
        address _token,
        address _owner
    ) public view returns (uint256) {
        return tokens[_token][_owner];
    }

    function makeOrder(
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive
    ) public {
        uint time = block.timestamp;
        uint256 id = 1;
        orders[id] = Order(
            id,
            msg.sender,
            tokenGet,
            amountGet,
            tokenGive,
            amountGive,
            time
        );
        emit OrderCreated(
            id,
            msg.sender,
            tokenGet,
            amountGet,
            tokenGive,
            amountGive,
            time
        );
    }

    function cancelOrder(uint256 id) public {
        Order storage order = orders[id];
        require(order.id == id);
        require(order.user == msg.sender);
        cancelledOrders[id] = true;
        emit OrderCancelled(
            id,
            msg.sender,
            order.tokenGet,
            order.amountGet,
            order.tokenGive,
            order.amountGive,
            order.timestamp
        );
    }
}
