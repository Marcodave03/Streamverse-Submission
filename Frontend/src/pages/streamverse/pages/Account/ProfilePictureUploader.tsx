// import { useDropzone } from "react-dropzone";
// import useBase64 from "../../../../hooks/useBase64";
// import { useEffect, useState } from "react";
// import axios from "axios";
// import { BASE_URL } from "./../../../../config/constants";
// import ProfilePicture from "../../../../components/streamverse/ProfilePicture";
// import { FaTrashAlt } from "react-icons/fa";
// import { UserType } from "../../../../types/UserTypes";
// import { useToaster } from "../../../../context/ToastContext";

// interface ProfilePictureUploaderProps {
//   user: UserType;
//   onUploadSuccess: () => void;
// }

// const ProfilePictureUploader = ({
//   user,
//   onUploadSuccess,
// }: ProfilePictureUploaderProps) => {
//   const { base64List, processImagesToBase64 } = useBase64();
//   const [uploadedImage, setUploadedImage] = useState<string | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const { toastSuccess, toastError } = useToaster();
//   const { getRootProps, getInputProps, isDragActive } = useDropzone({
//     accept: {
//       "image/*": [],
//     },
//     onDrop: (acceptedFiles) => {
//       processImagesToBase64(acceptedFiles);
//     },
//   });

//   useEffect(() => {
//     if (base64List.length > 0) {
//       updateProfilePicture(base64List[0]);
//     }
//   }, [base64List]);

//   const updateProfilePicture = async (base64Image: string) => {
//     try {
//       setLoading(true);
//       setError(null);

//       const token = localStorage.getItem("token");
//       const response = await axios.patch(
//         `${BASE_URL}/api/account/update-profile`,
//         { profile_picture: base64Image },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (response.status === 200) {
//         if (base64Image) {
//           toastSuccess("Profile picture updated successfully");
//         } else {
//           toastSuccess("Profile picture removed successfully");
//         }
//         setUploadedImage(base64Image);
//         onUploadSuccess();
//       }
//     } catch (err: any) {
//       console.error(err);
//       toastError("Failed to upload profile picture");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div
//       className={`border p-8 rounded-md max-w-[75%] bg-white transition-all duration-300 ${
//         isDragActive ? "border-purple-800 bg-purple-100" : "border-purple-500"
//       }`}
//     >
//       <div className="flex flex-col sm:flex-row gap-6 items-center relative">
//         <ProfilePicture
//           src={uploadedImage || user.profile.profile_picture}
//           full_name={user.profile.full_name}
//           className="sm:w-20 sm:h-20 w-24 h-24 relative"
//         />
//         <button
//           onClick={() => updateProfilePicture("")}
//           className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-600 hover:bg-red-800 text-white rounded-full p-2 shadow-md transition-all duration-300"
//           title="Remove"
//           disabled={loading}
//         >
//           <FaTrashAlt size={16} />
//         </button>
//         <div className="flex flex-col-reverse sm:flex-col gap-4">
//           <div
//             {...getRootProps()}
//             className={`cursor-pointer text-center bg-purple-600 hover:bg-purple-800 text-white rounded-md py-2 px-6 sm:max-w-52 ${
//               isDragActive ? "bg-purple-800" : "bg-purple-600"
//             }`}
//           >
//             <input {...getInputProps()} />
//             {loading
//               ? "Uploading..."
//               : isDragActive
//               ? "Drop the file here..."
//               : "Upload Profile Picture"}
//           </div>
//           <p className="text-center">
//             Must be JPEG, PNG, or AVIF and cannot exceed 1MB.
//           </p>
//           {error && <p className="text-red-500 text-center">{error}</p>}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProfilePictureUploader;
