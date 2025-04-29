import React, { useState } from "react"
import Modal from "react-modal"
import NavButton from "../Widget/NavButton"
import InteractiveButton from "../Widget/InteractiveButton"

Modal.setAppElement("#__next")

interface ProfileModalProps {
  isOpen: boolean
  onRequestClose: (profileUrl: string, username: string) => void
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onRequestClose,
}) => {
  const [profileUrl, setProfileUrl] = useState("")
  const [username, setUsername] = useState("")

  const handleSaveClick = () => {
    if (profileUrl || username) {
      onRequestClose(profileUrl, username)
    }
  }

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "grey",
      color: "black",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => onRequestClose(profileUrl, username)}
      style={customStyles}
    >
      <div className="flex flex-col items-center">
        <h2 className="text-2xl font-bold m-3">Edit Profile</h2>
        <label className="m-2 text-lg font-bold">{`Profile Picture (URL):   `}</label>
        <input
          type="text"
          value={profileUrl}
          onChange={(e) => setProfileUrl(e.target.value)}
        />
        <label className="m-2 text-lg font-bold">{`Username:   `}</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <div className="mt-6">
          <InteractiveButton onClick={handleSaveClick}>Save</InteractiveButton>
          <InteractiveButton onClick={onRequestClose}>Cancel</InteractiveButton>
        </div>
      </div>
    </Modal>
  )
}

export default ProfileModal
