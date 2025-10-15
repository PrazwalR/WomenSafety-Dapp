// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract WomenSafety {
    address public admin;
    uint256 public complaintCounter;
    uint256 public emergencyCounter;
    
    enum Severity { Low, Medium, High, Critical }
    enum ComplaintStatus { Pending, InProgress, Resolved }
    enum IncidentType { Harassment, Stalking, Assault, DomesticViolence, CyberBullying, Other }
    
    struct Complaint {
        uint256 id;
        address complainant;
        IncidentType incidentType;
        Severity severity;
        string description;
        string location;
        uint256 timestamp;
        ComplaintStatus status;
        string adminResponse;
    }
    
    struct TrustedContact {
        string phoneNumber;
        bool isActive;
    }
    
    struct Emergency {
        uint256 id;
        address user;
        string location;
        uint256 timestamp;
        string message;
        bool isResolved;
        string[] trustedContactsAlerted;
    }
    
    struct UserProfile {
        bool isRegistered;
        uint256[] complaintIds;
        uint256[] emergencyIds;
        string[] trustedContacts;
    }
    
    mapping(uint256 => Complaint) public complaints;
    mapping(uint256 => Emergency) public emergencies;
    mapping(address => UserProfile) public users;
    mapping(address => bool) public isAdmin;
    
    // Events
    event ComplaintFiled(uint256 indexed complaintId, address indexed complainant, IncidentType incidentType, Severity severity);
    event EmergencyDeclared(uint256 indexed emergencyId, address indexed user, string location, string[] trustedContacts);
    event EmergencyAlertToAdmin(uint256 indexed emergencyId, address indexed user, string message);
    event TrustedContactAdded(address indexed user, string phoneNumber);
    event ComplaintStatusUpdated(uint256 indexed complaintId, ComplaintStatus newStatus, string adminResponse);
    event AdminAdded(address indexed newAdmin);
    event TrustedContactRemoved(address indexed user, string phoneNumber);
    
    modifier onlyAdmin() {
        require(isAdmin[msg.sender], "Only admin can perform this action");
        _;
    }
    
    modifier onlyRegistered() {
        require(users[msg.sender].isRegistered, "Please register first");
        _;
    }
    
    constructor() {
        admin = msg.sender;
        isAdmin[msg.sender] = true;
    }
    
    function registerUser() public {
        require(!users[msg.sender].isRegistered, "User already registered");
        users[msg.sender].isRegistered = true;
    }
    
    function fileComplaint(
        IncidentType _incidentType,
        Severity _severity,
        string memory _description,
        string memory _location
    ) public onlyRegistered returns (uint256) {
        complaintCounter++;
        
        complaints[complaintCounter] = Complaint({
            id: complaintCounter,
            complainant: msg.sender,
            incidentType: _incidentType,
            severity: _severity,
            description: _description,
            location: _location,
            timestamp: block.timestamp,
            status: ComplaintStatus.Pending,
            adminResponse: ""
        });
        
        users[msg.sender].complaintIds.push(complaintCounter);
        
        emit ComplaintFiled(complaintCounter, msg.sender, _incidentType, _severity);
        return complaintCounter;
    }
    
    function declareEmergency(string memory _location, string memory _message) public onlyRegistered returns (uint256) {
        emergencyCounter++;
        
        // Get user's trusted contacts
        string[] memory userContacts = users[msg.sender].trustedContacts;
        
        emergencies[emergencyCounter] = Emergency({
            id: emergencyCounter,
            user: msg.sender,
            location: _location,
            timestamp: block.timestamp,
            message: _message,
            isResolved: false,
            trustedContactsAlerted: userContacts
        });
        
        users[msg.sender].emergencyIds.push(emergencyCounter);
        
        // Emit events for trusted contacts and admin
        emit EmergencyDeclared(emergencyCounter, msg.sender, _location, userContacts);
        emit EmergencyAlertToAdmin(emergencyCounter, msg.sender, _message);
        
        return emergencyCounter;
    }
    
    function addTrustedContact(string memory _phoneNumber) public onlyRegistered {
        require(users[msg.sender].trustedContacts.length < 5, "Maximum 5 trusted contacts allowed");
        
        // Check if phone number already exists
        for (uint i = 0; i < users[msg.sender].trustedContacts.length; i++) {
            require(
                keccak256(bytes(users[msg.sender].trustedContacts[i])) != keccak256(bytes(_phoneNumber)),
                "Phone number already added"
            );
        }
        
        users[msg.sender].trustedContacts.push(_phoneNumber);
        emit TrustedContactAdded(msg.sender, _phoneNumber);
    }
    
    function removeTrustedContact(uint256 _index) public onlyRegistered {
        require(_index < users[msg.sender].trustedContacts.length, "Invalid contact index");
        
        string memory phoneToRemove = users[msg.sender].trustedContacts[_index];
        
        // Remove by shifting elements
        for (uint i = _index; i < users[msg.sender].trustedContacts.length - 1; i++) {
            users[msg.sender].trustedContacts[i] = users[msg.sender].trustedContacts[i + 1];
        }
        users[msg.sender].trustedContacts.pop();
        
        emit TrustedContactRemoved(msg.sender, phoneToRemove);
    }
    
    function updateComplaintStatus(
        uint256 _complaintId,
        ComplaintStatus _status,
        string memory _adminResponse
    ) public onlyAdmin {
        require(_complaintId > 0 && _complaintId <= complaintCounter, "Invalid complaint ID");
        complaints[_complaintId].status = _status;
        complaints[_complaintId].adminResponse = _adminResponse;
        emit ComplaintStatusUpdated(_complaintId, _status, _adminResponse);
    }
    
    function resolveEmergency(uint256 _emergencyId) public onlyAdmin {
        require(_emergencyId > 0 && _emergencyId <= emergencyCounter, "Invalid emergency ID");
        emergencies[_emergencyId].isResolved = true;
    }
    
    function addAdmin(address _newAdmin) public onlyAdmin {
        require(!isAdmin[_newAdmin], "Already an admin");
        isAdmin[_newAdmin] = true;
        emit AdminAdded(_newAdmin);
    }
    
    // View functions
    function getUserComplaints(address _user) public view returns (uint256[] memory) {
        return users[_user].complaintIds;
    }
    
    function getUserEmergencies(address _user) public view returns (uint256[] memory) {
        return users[_user].emergencyIds;
    }
    
    function getTrustedContacts(address _user) public view returns (string[] memory) {
        return users[_user].trustedContacts;
    }
    
    function getMyComplaints() public view onlyRegistered returns (Complaint[] memory) {
        uint256[] memory myComplaintIds = users[msg.sender].complaintIds;
        Complaint[] memory myComplaints = new Complaint[](myComplaintIds.length);
        
        for (uint256 i = 0; i < myComplaintIds.length; i++) {
            myComplaints[i] = complaints[myComplaintIds[i]];
        }
        
        return myComplaints;
    }
    
    function getAllComplaints() public view onlyAdmin returns (Complaint[] memory) {
        Complaint[] memory allComplaints = new Complaint[](complaintCounter);
        for (uint256 i = 1; i <= complaintCounter; i++) {
            allComplaints[i - 1] = complaints[i];
        }
        return allComplaints;
    }
    
    function getAllEmergencies() public view onlyAdmin returns (Emergency[] memory) {
        Emergency[] memory allEmergencies = new Emergency[](emergencyCounter);
        for (uint256 i = 1; i <= emergencyCounter; i++) {
            allEmergencies[i - 1] = emergencies[i];
        }
        return allEmergencies;
    }
    
    function getComplaintStats() public view returns (
        uint256 total,
        uint256 pending,
        uint256 inProgress,
        uint256 resolved
    ) {
        total = complaintCounter;
        
        for (uint256 i = 1; i <= complaintCounter; i++) {
            if (complaints[i].status == ComplaintStatus.Pending) pending++;
            else if (complaints[i].status == ComplaintStatus.InProgress) inProgress++;
            else if (complaints[i].status == ComplaintStatus.Resolved) resolved++;
        }
    }
    
    function isUserAdmin(address _user) public view returns (bool) {
        return isAdmin[_user];
    }
    
    function isUserRegistered(address _user) public view returns (bool) {
        return users[_user].isRegistered;
    }
}