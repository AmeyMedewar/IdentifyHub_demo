import React from "react";
import { User } from "../../../types/user";
import { Eye, Pencil, Power, Trash2 } from "lucide-react";
import { Button } from "../../ui/Button";

interface Props {
  users: User[];
  onToggleActive: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (user: User) => void;
  onView: (user: User) => void;
}

const UserTable: React.FC<Props> = ({
  users,
  onToggleActive,
  onDelete,
  onEdit,
  onView,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border border-gray-200 rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">ID</th>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Face Enrolled</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => {
            const isActive = user.active;

            return (
              <tr key={user.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{user.id}</td>
                <td className="p-3 font-medium">{user.name}</td>
                <td className="p-3">{user.email}</td>

                {/* STATUS */}
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                      }`}
                  >
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </td>

                <td className="p-3">No</td>

                {/* ACTION BUTTONS */}
                <td className="p-3 flex gap-2">

                  {/* VIEW */}
                  <Button
                    size="sm"
                    variant="info"
                    title="View Details"
                    onClick={() => onView(user)}
                  >
                    <Eye size={16} />
                  </Button>


                  {/* EDIT */}
                  <Button
                    size="sm"
                    variant="warning"
                    title="Edit User"
                    onClick={() => onEdit(user)}
                  >
                    <Pencil size={16} />
                  </Button>

                  {/* ACTIVATE / DEACTIVATE */}
                  <Button
                    size="sm"
                    variant={isActive ? "secondary" : "success"}
                    title={isActive ? "Deactivate User" : "Activate User"}
                    onClick={() => onToggleActive(user.id)}
                  >
                    <Power size={16} />
                  </Button>

                  {/* DELETE */}
                  <Button
                    size="sm"
                    variant="danger"
                    title="Delete User"
                    onClick={() => onDelete(user.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
