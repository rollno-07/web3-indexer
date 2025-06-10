// utils/web3.ts
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);

export default provider;
// EventLog {
//     provider: JsonRpcProvider {},
//     transactionHash: '0x898dfa309004da99aeb5e868b504a0d89f48720685c3a243e0b315b39f1c4c9c',
//     blockHash: '0x51487da447348c60b133143eb6ce9541b87dc905100f13085f46b2519ee106c7',
//     blockNumber: 19070037,
//     removed: false,
//     address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
//     data: '0x000000000000000000000000000000000000000000000000000000000bef590c',
//     topics: [
//       '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
//       '0x00000000000000000000000048f8199afcbe384f1a84d01aabf18b8f02188e6d',
//       '0x000000000000000000000000808d0aee8db7e7c74faf4b264333afe8c9ccdba4'
//     ],
//     index: 91,
//     transactionIndex: 55,
//     interface: Interface {
//       fragments: [Array],
//       deploy: [ConstructorFragment],
//       fallback: null,
//       receive: false
//     },
//     fragment: EventFragment {
//       type: 'event',
//       inputs: [Array],
//       name: 'Transfer',
//       anonymous: false
//     },
//     args: Result(3) [
//       '0x48F8199afCBE384f1a84d01Aabf18B8F02188e6d',
//       '0x808d0aeE8db7E7c74FaF4b264333aFE8c9cCDBA4',
//       200235276n
//     ]
//   },