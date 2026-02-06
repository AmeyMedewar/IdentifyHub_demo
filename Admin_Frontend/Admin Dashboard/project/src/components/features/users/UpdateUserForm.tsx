import React, { useState } from "react";
import { User, UpdateUserDTO } from "../../../types/user";

interface Props {
    user: User;
    onSubmit: (data: UpdateUserDTO) => void;
    onCancel: () => void;
}

const UpdateUserForm: React.FC<Props> = ({ user, onSubmit, onCancel }) => {
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber);
    const [dateOfBirth, setDateOfBirth] = useState(user.dateOfBirth);
    const [gender, setGender] = useState(user.gender || "");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        onSubmit({
            name,
            email,
            phoneNumber,
            dateOfBirth,
            gender,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-semibold">Edit User</h3>

            <div>
                <label className="block text-sm font-medium">Name</label>
                <input
                    className="w-full border p-2 rounded"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>

            <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                    className="w-full border p-2 rounded"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div>
                <label className="block text-sm font-medium">Phone</label>
                <input
                    className="w-full border p-2 rounded"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                />
            </div>

            <div>
                <label className="block text-sm font-medium">DOB</label>
                <input
                    type="date"
                    className="w-full border p-2 rounded"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                />
            </div>

            <div>
                <label className="block text-sm font-medium">Gender</label>
                <select
                    className="w-full border p-2 rounded"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            <div className="flex gap-2 pt-2">
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Update
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default UpdateUserForm;
