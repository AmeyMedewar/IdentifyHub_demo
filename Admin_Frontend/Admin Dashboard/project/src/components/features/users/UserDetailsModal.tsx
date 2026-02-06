import React from "react";
import { User } from "../../../types/user";
import { Modal } from "../../ui/Modal";

interface Props {
    user: User | null;
    isOpen: boolean;
    onClose: () => void;
}

const UserDetailsModal: React.FC<Props> = ({ user, isOpen, onClose }) => {
    if (!user) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="User Details">
            <div className="space-y-4">
                <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="text-lg font-semibold text-gray-800">{user.name}</p>
                </div>

                <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-lg text-gray-800">{user.email}</p>
                </div>

                <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="text-lg text-gray-800">{user.phoneNumber}</p>
                </div>

                <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="text-lg text-gray-800">{user.dateOfBirth}</p>
                </div>

                <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="text-lg text-gray-800">{user.gender}</p>
                </div>

                <div>
                    <p className="text-sm text-gray-500">Current Status</p>
                    <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${user.currentStatus === "PRESENT"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                    >
                        {user.currentStatus}
                    </span>
                </div>

                <div>
                    <p className="text-sm text-gray-500">Created At</p>
                    <p className="text-lg text-gray-800">
                        {new Date(user.createdAt).toLocaleString()}
                    </p>
                </div>

                <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="text-lg text-gray-800">
                        {new Date(user.updatedAt).toLocaleString()}
                    </p>
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default UserDetailsModal;
