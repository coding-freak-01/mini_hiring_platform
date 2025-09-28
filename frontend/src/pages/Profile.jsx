import React from "react"
import useAuthStore from "../store/useAuthStore"

const Profile = () => {
    const { user } = useAuthStore()

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">My Profile</h2>
            <div className="space-y-2">
                <p><span className="font-semibold">Name:</span> {user?.name}</p>
                <p><span className="font-semibold">Email:</span> {user?.email}</p>
                <p><span className="font-semibold">Role:</span> Candidate</p>
            </div>
        </div>
    )
}

export default Profile
