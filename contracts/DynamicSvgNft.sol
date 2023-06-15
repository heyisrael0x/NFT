// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./library/base64.sol";

contract DynamicSvgNft is ERC721 {
    uint256 private s_tokenCounter;
    string private i_lowImageURI;
    string private i_highImageURI;
    string private constant base64EncodedSvgPrefix =
        "data:image/svg+xml;base64";

    constructor(
        string memory lowSvg,
        string memory highSvg
    ) ERC721("Dynamic SVG NFT", "DSN") {
        s_tokenCounter = 0;
        // i_lowImageURI = lowSvg;
        // i_highImageURI = highSvg;
    }

    function svgToImageURI(
        string memory svg
    ) public pure returns (string memory) {
        string memory svgBase64Encoded = Base64.encode(
            bytes(string(abi.encodePacked(svg)))
        );
        return
            string(abi.encodePacked(base64EncodedSvgPrefix, svgBase64Encoded));
    }

    function mintNft() public {
        uint256 tokenId = s_tokenCounter;
        s_tokenCounter += 1;
        _safeMint(msg.sender, tokenId);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64";
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );
        string memory imageURI = "hi";

        // "data:image/svg+xml;base64";
        // "data:application/json;base64";
        return
            string(
                abi.encodePacked(
                    _baseURI(),
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                name(),
                                '", "description":"An NFT that changes based on the Chainlink Feed", ',
                                '"attributes": [{"trait_type":"coolness", "value": 100}], "image":',
                                imageURI,
                                '"}'
                            )
                        )
                    )
                )
            );
    }
}
