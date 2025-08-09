// import React from "react";

// type AnimationPickerProps = {
//   onClose: () => void;
//   onSelectAnimation: (animation: string) => void;
// };

// const AnimationPicker: React.FC<AnimationPickerProps> = ({ onClose, onSelectAnimation }) => {
//   const animations = [
//     "F_Dances_001",
//     "F_Dances_004",
//     "F_Dances_005",
//     "F_Dances_006",
//     "F_Dances_007",
//     "M_Dances_001",
//     "M_Dances_002",
//     "M_Dances_003",
//     "M_Dances_004",
//     "M_Dances_005",
//     "M_Dances_006",
//     "M_Dances_007",
//     "M_Dances_008",
//     "M_Dances_009",
//     "M_Dances_011",
//   ];

//   return (
//     <div className="fixed bottom-4 right-4 bg-white p-6 rounded-lg shadow-lg z-50">
//       <h3 className="text-xl mb-4">Select Animation</h3>
//       <div className="max-h-60 overflow-y-auto">
//         {animations.map((anim) => (
//           <button
//             key={anim}
//             className="block w-full py-2 px-4 hover:bg-gray-100 text-left"
//             onClick={() => {
//               onSelectAnimation(anim);
//               onClose();
//             }}
//           >
//             {anim}
//           </button>
//         ))}
//       </div>
//       <button onClick={onClose} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">
//         Close
//       </button>
//     </div>
//   );
// };

// export default AnimationPicker;
