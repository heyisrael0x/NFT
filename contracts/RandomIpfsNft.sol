// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error RandomIpfsNft__OutOfBounds();
error RandomIpfsNft__NotEnoughEthSent();
error RandomIpfsNft__TransferFailed();

contract RandomIpfsNft is VRFConsumerBaseV2, ERC721URIStorage, Ownable {
    // Type Declarions
    enum Breed {
        KING_PUNK,
        CAPTAIN_PUNK,
        BANDANA_PUNK
    }

    // ChainLink VRF Variables
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    // VRF Helpers
    mapping(uint256 => address) s_requestIdToSender;

    // NFT Variables
    uint256 private s_tokenCounter;
    uint256 internal constant MAX_CHANCE_VALUE = 100;
    string[] internal s_nftTokenUris;
    uint256 internal immutable i_mintFee;

    // Events
    event NftRequested(uint256 indexed requestId, address requester);
    event NftMinted(Breed nftBreed, address minter);

    constructor(
        address vrfCoordinatorV2,
        uint64 subscriptionId,
        bytes32 gasLane,
        uint32 callbackGasLimit,
        string[3] memory nftTokenUris,
        uint256 mintFee
    ) VRFConsumerBaseV2(vrfCoordinatorV2) ERC721("Random IPFS NFT", "RIN") {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_subscriptionId = subscriptionId;
        i_gasLane = gasLane;
        i_callbackGasLimit = callbackGasLimit;
        s_nftTokenUris = nftTokenUris;
        i_mintFee = mintFee;
    }

    function requestNft() public payable returns (uint256 requestId) {
        if (msg.value < i_mintFee) {
            revert RandomIpfsNft__NotEnoughEthSent();
        }
        requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        s_requestIdToSender[requestId] = msg.sender;
        emit NftRequested(requestId, msg.sender);
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        address nftOwner = s_requestIdToSender[requestId];
        uint256 newTokenId = s_tokenCounter;
        s_tokenCounter++;
        uint256 moddedRng = randomWords[0] % MAX_CHANCE_VALUE;
        /**
         * 0 - 99
         * 7 -> Pug.
         * 88 -> St.Benard.
         * 45 -> St.Benard.
         * 12 -> Shiba Inu.
         */
        Breed nftBreed = getBreedFromModdedRng(moddedRng);
        _safeMint(nftOwner, newTokenId);
        _setTokenURI(newTokenId, s_nftTokenUris[uint256(nftBreed)]);
        emit NftMinted(nftBreed, nftOwner);
    }

    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) {
            revert RandomIpfsNft__TransferFailed();
        }
    }

    function getBreedFromModdedRng(
        uint256 moddedRng
    ) public pure returns (Breed) {
        uint256 cummulativeSum = 0;
        uint256[3] memory chanceArray = getChanceArray();
        for (uint i = 0; i < chanceArray.length; i++) {
            if (
                moddedRng >= cummulativeSum &&
                moddedRng < cummulativeSum + chanceArray[i]
            ) {
                return Breed(i);
            }
            cummulativeSum += chanceArray[i];
        }
        revert RandomIpfsNft__OutOfBounds();
    }

    function getChanceArray() public pure returns (uint256[3] memory) {
        return [10, 30, MAX_CHANCE_VALUE];
    }

    function getMintFee(uint256) public view returns (uint256) {
        return i_mintFee;
    }

    function getNftTokenUris(
        uint256 index
    ) public view returns (string memory) {
        return s_nftTokenUris[index];
    }

    function getTokenCounter(uint256) public view returns (uint256) {
        return s_tokenCounter;
    }
}
