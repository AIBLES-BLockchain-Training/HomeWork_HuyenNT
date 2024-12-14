const {
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");

describe("DigitalAsset Contracts", function () {
  let ArtAsset, artAsset, MusicAsset, musicAsset, AssetFactory, assetFactory;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy ArtAsset
    ArtAsset = await ethers.getContractFactory("ArtAsset");
    artAsset = await ArtAsset.deploy("ArtistName", "ArtName");
    await artAsset.waitForDeployment();

    // Deploy MusicAsset
    MusicAsset = await ethers.getContractFactory("MusicAsset");
    musicAsset = await MusicAsset.deploy("SongName", "SingerName", "AuthorName");
    await musicAsset.waitForDeployment();

    // Deploy AssetFactory
    AssetFactory = await ethers.getContractFactory("AssetFactory");
    assetFactory = await AssetFactory.deploy();
    await assetFactory.waitForDeployment();
  });
  describe("AbstractAsset", function () {
    it("should return the correct name via getDetails", async function () {
      expect(await artAsset.getDetails()).to.equal("");
      expect(await musicAsset.getDetails()).to.equal("");
    });

    it("should return the correct name even if set to an empty string", async function () {
      const EmptyNameArtAsset = await ethers.getContractFactory("ArtAsset");
      const emptyNameArtAsset = await EmptyNameArtAsset.deploy("ArtistName", "");
      await emptyNameArtAsset.waitForDeployment();
      expect(await emptyNameArtAsset.getDetails()).to.equal("");
    });

    it("should return the correct name with special characters", async function () {
      const SpecialCharArtAsset = await ethers.getContractFactory("ArtAsset");
      const specialCharArtAsset = await SpecialCharArtAsset.deploy("ArtistName", "");
      await specialCharArtAsset.waitForDeployment();
      expect(await specialCharArtAsset.getDetails()).to.equal("");
    });
  });


  describe("ArtAsset", function () {
    it("should return correct artist name and art name", async function () {
      expect(await artAsset.getArtistName()).to.equal("ArtistName");
      expect(await artAsset.getArtName()).to.equal("ArtName");
    });

    it("should allow owner to set artist name and art name", async function () {
      await artAsset.setArtistName("NewArtistName");
      await artAsset.setArtName("NewArtName");
      expect(await artAsset.getArtistName()).to.equal("NewArtistName");
      expect(await artAsset.getArtName()).to.equal("NewArtName");
    });

    it("should not allow non-owner to set artist name and art name", async function () {
      await expect(artAsset.connect(addr1).setArtistName("NewArtistName")).to.be.revertedWith("Only the owner has the right to transfer");
      await expect(artAsset.connect(addr1).setArtName("NewArtName")).to.be.revertedWith("Only the owner has the right to transfer");
    });
    it("should correctly set the art name when called by the owner", async function () {
      const newArtName = "UpdatedArtName";
      await artAsset.setArtName(newArtName);
      expect(await artAsset.getArtName()).to.equal(newArtName);
    });

    it("should revert when a non-owner tries to set the art name", async function () {
      await expect(artAsset.connect(addr1).setArtName("UpdatedArtName")).to.be.revertedWith("Only the owner has the right to transfer");
    });

    it("should update the artName correctly via the setter function", async function () {
      const newArtName = "ArtName123";
      await artAsset.setArtName(newArtName);
      expect(await artAsset.getArtName()).to.equal(newArtName);
    });
    it("should update the artist name correctly via the setter function", async function () {
      const newArtistName = "NewArtistName";
      await artAsset.setArtistName(newArtistName);
      expect(await artAsset.getArtistName()).to.equal(newArtistName);
    });
  
  });

  describe("MusicAsset", function () {
    it("should return correct song name, singer name and author name", async function () {
      expect(await musicAsset.getSongName()).to.equal("SongName");
      expect(await musicAsset.getSingerName()).to.equal("SingerName");
      expect(await musicAsset.getAuthorName()).to.equal("AuthorName");
    });

    it("should allow owner to set song name, singer name and author name", async function () {
      await musicAsset.setSongName("NewSongName");
      await musicAsset.setSingerName("NewSingerName");
      await musicAsset.setAuthorName("NewAuthorName");
      expect(await musicAsset.getSongName()).to.equal("NewSongName");
      expect(await musicAsset.getSingerName()).to.equal("NewSingerName");
      expect(await musicAsset.getAuthorName()).to.equal("NewAuthorName");
    });

    it("should not allow non-owner to set song name, singer name and author name", async function () {
      await expect(musicAsset.connect(addr1).setSongName("NewSongName")).to.be.revertedWith("Only the owner has the right to transfer");
      await expect(musicAsset.connect(addr1).setSingerName("NewSingerName")).to.be.revertedWith("Only the owner has the right to transfer");
      await expect(musicAsset.connect(addr1).setAuthorName("NewAuthorName")).to.be.revertedWith("Only the owner has the right to transfer");
    });
    it("should update the song name correctly via the setter function", async function () {
      const newSongName = "NewSongName";
      await musicAsset.setSongName(newSongName);
      expect(await musicAsset.getSongName()).to.equal(newSongName);
    });
  
    it("should update the singer name correctly via the setter function", async function () {
      const newSingerName = "NewSingerName";
      await musicAsset.setSingerName(newSingerName);
      expect(await musicAsset.getSingerName()).to.equal(newSingerName);
    });
  
    it("should update the author name correctly via the setter function", async function () {
      const newAuthorName = "NewAuthorName";
      await musicAsset.setAuthorName(newAuthorName);
      expect(await musicAsset.getAuthorName()).to.equal(newAuthorName);
    });
    
  });


  describe("AssetFactory", function () {
    it("should create ArtAsset and MusicAsset", async function () {
      await assetFactory.createAsset(0, "FactoryArtistName", "FactoryArtName", "", "", "");
      await assetFactory.createAsset(1, "", "", "FactorySongName", "FactorySingerName", "FactoryAuthorName");

      const artAddress = await assetFactory.createdAssets(0);
      const musicAddress = await assetFactory.createdAssets(1);

      const artAssetFromFactory = await ethers.getContractAt("ArtAsset", artAddress);
      const musicAssetFromFactory = await ethers.getContractAt("MusicAsset", musicAddress);

      expect(await artAssetFromFactory.getArtistName()).to.equal("FactoryArtistName");
      expect(await artAssetFromFactory.getArtName()).to.equal("FactoryArtName");
      expect(await musicAssetFromFactory.getSongName()).to.equal("FactorySongName");
      expect(await musicAssetFromFactory.getSingerName()).to.equal("FactorySingerName");
      expect(await musicAssetFromFactory.getAuthorName()).to.equal("FactoryAuthorName");
    });
    
  });
});
