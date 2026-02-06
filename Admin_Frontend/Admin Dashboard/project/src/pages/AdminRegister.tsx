import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ClipboardList, ArrowLeft } from 'lucide-react';
import { ROUTES } from '../utils/constants';

const AdminRegister = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleRegister = (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const adminData = {
                email: email.trim(),
                password: password.trim(),
            };

            // Save admin credentials
            localStorage.setItem('localAdmin', JSON.stringify(adminData));

            // DEBUG: confirm it saved
            console.log('Saved Admin:', localStorage.getItem('localAdmin'));

            alert('Admin registered successfully');
            navigate(ROUTES.LOGIN);
        } catch (err) {
            setError('Failed to register admin');
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                            <ClipboardList size={32} className="text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Register Admin
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Create initial admin credentials
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleRegister} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <Input
                            type="email"
                            label="Admin Email"
                            placeholder="admin@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <Input
                            type="password"
                            label="Password"
                            placeholder="Create a strong password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full"
                            isLoading={isLoading}
                        >
                            Register Admin
                        </Button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t text-center">
                        <button
                            type="button"
                            onClick={() => navigate(ROUTES.LOGIN)}
                            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
                        >
                            <ArrowLeft size={16} />
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminRegister;
