// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "./Token.sol";

contract Exchange {
    // TODO:
    // [X] Set the fee account
    // [X] Deposit Ether 对应 depositEther
    // [X] Withdraw Ether
    // [X] Deposit tokens 对应 depositToken
    // [X] Withdraw tokens
    // [X] Check balances
    // [X] Make order
    // [X] Cancel order
    // [X] Fill order
    // [X] Charge fees
    address public feeAccount;
    uint256 public feePercentage;
    address constant ETHER = address(0);
    //token address => user address => total
    mapping(address => mapping(address => uint256)) public tokens;

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
}
