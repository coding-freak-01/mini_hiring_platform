import React from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowLeft } from 'lucide-react'

const Unauthorized = () => {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
                    <div className="flex justify-center mb-4">
                        <AlertTriangle className="h-16 w-16 text-red-500" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Access Denied
                    </h2>

                    <p className="text-gray-600 mb-6">
                        You don't have permission to access this page. Please contact your administrator.
                    </p>

                    <button
                        onClick={() => navigate('/login')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Unauthorized
