import { chatContext } from "../../AppContext/context";

const ProfileModal = ({ profileUser, isGroupChat }) => {
  const { setProfileUser } = chatContext();

  if (!profileUser) return null;

  return (
    <div className="w-full h-full bg-black/50 fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white w-96 rounded-2xl p-6 relative shadow-xl">
        <button
          onClick={() => {
            setProfileUser(null);
          }}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
          aria-label="Close profile"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4 text-center">
          {profileUser.title}
        </h2>

        <div className="flex flex-col items-center gap-3 text-center">
          <img
            src={profileUser?.image || "/avatar.png"}
            alt="profile"
            className="w-24 h-24 rounded-full object-cover"
          />
          <p className="text-sm text-gray-600">
            {isGroupChat ? "Admin: " : "Email: "}
            {profileUser.desc}
          </p>
          {profileUser.users && (
            <p className="text-sm text-gray-600">
              Users: {profileUser.users?.map((u) => u.username).join(", ")}
            </p>
          )}
        </div>

        <button
          onClick={() => {
            setProfileUser(null);
          }}
          className="mt-6 w-full bg-black text-white py-2 rounded-lg hover:bg-gray-900"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ProfileModal;
