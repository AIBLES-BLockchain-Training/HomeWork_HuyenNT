// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
interface IDigitalAsset {
    function getDetails() external view returns(string memory);
    function transferOwnership(address newOwner) external;  
}
abstract contract AbstractAsset is  IDigitalAsset{
    string internal name;
    address internal owner;
    constructor(string memory _name){
        name = _name;
        owner = msg.sender;
    }
    function getDetails() public view virtual override returns (string memory){
        return (name);
    }
    function transferOwnership(address newOwner) public virtual override;
}
contract ArtAsset is AbstractAsset {
    string public artistName;
    string public artName;

    constructor (string memory _artistName, string memory _artName) AbstractAsset(name){
        artistName = _artistName;
        artName = _artName;
    }
    modifier onlyOwner(){
        require(msg.sender == owner, "Only the owner has the right to transfer");
        _;
    }
    function setArtistName(string memory _artistName) public onlyOwner{
        artistName = _artistName;
    }
    function setArtName(string memory _artName) public onlyOwner{
        artName =_artName;
    }
    function transferOwnership(address newOwner) public virtual override {
        owner = newOwner;
    }
    function getArtistName() public view returns(string memory){
        return artistName;
    }
    function getArtName() public view returns(string memory){
        return artName;
    }
}
contract MusicAsset is AbstractAsset{
    string public songName;
    string public singerName;
    string public authorName;

    constructor (string memory _songName, string memory _singerName, string memory _authorName) AbstractAsset(name){
        songName = _songName;
        singerName = _singerName;
        authorName = _authorName;
    }
    modifier onlyOwner(){
        require(msg.sender == owner, "Only the owner has the right to transfer");
        _;
    }
    function setSongName(string memory _songName) public onlyOwner{
        songName = _songName;
    }
    function setSingerName(string memory _singerName) public onlyOwner{
        singerName = _singerName;
    }
    function setAuthorName(string memory _authorName) public onlyOwner{
        authorName = _authorName;
    }    
    function transferOwnership(address newOwner) public virtual override {
        owner = newOwner;
    }
    function getSongName() public view returns(string memory){
        return songName;
    }
    function getSingerName() public view returns(string memory){
        return singerName;
    }
    function getAuthorName() public view returns(string memory){
        return authorName;
    }
}
contract AssetFactory {
    enum AssetType {Art, Music}
    address[] public createdAssets;

    function createAsset(AssetType assetType, string memory _artistName, string memory _artName, string memory _songName, string memory _singerName, string memory _authorName) external {
        if (assetType == AssetType.Art) {
            ArtAsset newAsset = new ArtAsset(_artistName, _artName);
            createdAssets.push(address(newAsset));
        } else if (assetType == AssetType.Music) {
            MusicAsset newAsset = new MusicAsset(_songName, _singerName, _authorName);
            createdAssets.push(address(newAsset));
        } else {
            revert("Invalid asset type");
        }
    }
}

