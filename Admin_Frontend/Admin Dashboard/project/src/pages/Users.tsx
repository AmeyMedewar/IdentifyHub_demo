import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useUsers } from '../hooks/useUsers';
import UserTable from '../components/features/users/UserTable';
import { UserForm } from '../components/features/users/UserForm';
import UpdateUserForm from '../components/features/users/UpdateUserForm';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';
import { Card } from '../components/ui/Card';
import { CreateUserDTO, UpdateUserDTO, User } from '../types/user';

export const Users = () => {
  const {
    users,
    totalElements,
    totalPages,
    isLoading,
    error,
    fetchUsers,
    createUser,
    deleteUser,
    toggleUserActive,
    updateUser,
  } = useUsers();

  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers(currentPage, 10, searchQuery);
  }, [currentPage, searchQuery, fetchUsers]);

  const handleCreateUser = async (user: CreateUserDTO) => {
    await createUser(user);
    setIsCreateModalOpen(false);
    fetchUsers(currentPage, 10, searchQuery);
  };

  const handleDeleteUser = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await deleteUser(id);
      fetchUsers(currentPage, 10, searchQuery);
    }
  };

  const handleToggleActive = async (id: number) => {
    await toggleUserActive(id);
    fetchUsers(currentPage, 10, searchQuery);
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleViewClick = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleUpdateUser = async (data: UpdateUserDTO) => {
    if (!selectedUser) return;
    await updateUser(selectedUser.id, data);
    setIsEditModalOpen(false);
    setSelectedUser(null);
    fetchUsers(currentPage, 10, searchQuery);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(0);
  };

  if (isLoading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Users Management</h2>
          <p className="text-gray-600">Manage employee accounts and details</p>
        </div>
        <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={20} className="mr-2" />
          Add User
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <Card>
        <div className="mb-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <UserTable
          users={users}
          onToggleActive={handleToggleActive}
          onDelete={handleDeleteUser}
          onEdit={handleEditClick}
          onView={handleViewClick}
        />

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {users.length} of {totalElements} users
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-sm text-gray-700">
              Page {currentPage + 1} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={currentPage >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* CREATE USER */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New User"
      >
        <UserForm
          onSubmit={handleCreateUser}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* EDIT USER */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit User"
      >
        {selectedUser && (
          <UpdateUserForm
            user={selectedUser}
            onSubmit={handleUpdateUser}
            onCancel={() => setIsEditModalOpen(false)}
          />
        )}
      </Modal>



      {/* VIEW USER */}
      {/* VIEW USER */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="User Details"
      >
        {selectedUser && (
          <div className="space-y-6">

            <div className="grid grid-cols-2 gap-6 text-sm">

              <div>
                <p className="text-gray-500">User ID</p>
                <p className="font-medium">{selectedUser.id}</p>
              </div>

              <div>
                <p className="text-gray-500">Name</p>
                <p className="font-medium">{selectedUser.name}</p>
              </div>

              <div>
                <p className="text-gray-500">Email</p>
                <p className="font-medium">{selectedUser.email}</p>
              </div>

              <div>
                <p className="text-gray-500">Phone</p>
                <p className="font-medium">{selectedUser.phoneNumber}</p>
              </div>

              <div>
                <p className="text-gray-500">Gender</p>
                <p className="font-medium">{selectedUser.gender}</p>
              </div>

              <div>
                <p className="text-gray-500">Date of Birth</p>
                <p className="font-medium">{selectedUser.dateOfBirth}</p>
              </div>

              <div>
                <p className="text-gray-500">Created At</p>
                <p className="font-medium">{selectedUser.createdAt}</p>
              </div>

              <div>
                <p className="text-gray-500">Updated At</p>
                <p className="font-medium">{selectedUser.updatedAt}</p>
              </div>

              <div>
                <p className="text-gray-500">Account Status</p>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${selectedUser.active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                    }`}
                >
                  {selectedUser.active ? "Active" : "Inactive"}
                </span>
              </div>

            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsViewModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>



    </div>
  );
};
