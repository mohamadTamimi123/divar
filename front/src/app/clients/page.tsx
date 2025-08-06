'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainMenu from "../../../components/MainMenu/MainMenu";
import SideBar from "../../../components/SideBar/SideBar";
import { FaUserPlus, FaSearch, FaEdit, FaTrash, FaFolder, FaEye, FaPlus, FaUsers } from 'react-icons/fa';
import { isLoggedIn, redirectToLogin } from '../../../utils/authUtils';

interface Client {
  id: number;
  name: string;
  phone: string;
  propertyType: 'sale' | 'rent' | 'land' | 'partnership';
  area: string;
  city: string;
  budget?: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  files?: ClientFile[];
}

interface ClientFile {
  id: number;
  filename: string;
  title: string;
  isNew: boolean;
  isRead: boolean;
  matchScore?: number;
  createdAt: string;
}

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFilesModal, setShowFilesModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    propertyType: 'sale' as 'sale' | 'rent' | 'land' | 'partnership',
    area: '',
    city: '',
    budget: '',
    description: ''
  });

  useEffect(() => {
    // Check if user is logged in
    if (!isLoggedIn()) {
      redirectToLogin();
      return;
    }
    
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('userToken') || localStorage.getItem('token');
      
      if (!token) {
        redirectToLogin();
        return;
      }
      
      const apiPath = process.env.NEXT_PUBLIC_API_PATH || 'http://localhost:5001';
      
      const response = await fetch(`${apiPath}/api/v1/clients`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        // Token is invalid or expired
        redirectToLogin();
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      } else {
        console.error('Failed to fetch clients');
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is logged in before adding client
    if (!isLoggedIn()) {
      redirectToLogin();
      return;
    }
    
    try {
      const token = localStorage.getItem('userToken') || localStorage.getItem('token');
      
      if (!token) {
        redirectToLogin();
        return;
      }
      
      const apiPath = process.env.NEXT_PUBLIC_API_PATH || 'http://localhost:5001';
      
      const response = await fetch(`${apiPath}/api/v1/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          budget: formData.budget ? parseInt(formData.budget) : null
        })
      });

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      if (response.ok) {
        setShowAddModal(false);
        setFormData({
          name: '',
          phone: '',
          propertyType: 'sale',
          area: '',
          city: '',
          budget: '',
          description: ''
        });
        fetchClients();
        alert('مشتری با موفقیت اضافه شد');
      } else {
        const error = await response.json();
        alert(error.error || 'خطا در افزودن مشتری');
      }
    } catch (error) {
      console.error('Error adding client:', error);
      alert('خطا در افزودن مشتری');
    }
  };

  const handleEditClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    // Check if user is logged in before editing client
    if (!isLoggedIn()) {
      redirectToLogin();
      return;
    }

    try {
      const token = localStorage.getItem('userToken') || localStorage.getItem('token');
      
      if (!token) {
        redirectToLogin();
        return;
      }
      
      const apiPath = process.env.NEXT_PUBLIC_API_PATH || 'http://localhost:5001';
      
      const response = await fetch(`${apiPath}/api/v1/clients/${selectedClient.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          budget: formData.budget ? parseInt(formData.budget) : null
        })
      });

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      if (response.ok) {
        setShowEditModal(false);
        setSelectedClient(null);
        fetchClients();
        alert('مشتری با موفقیت ویرایش شد');
      } else {
        const error = await response.json();
        alert(error.error || 'خطا در ویرایش مشتری');
      }
    } catch (error) {
      console.error('Error editing client:', error);
      alert('خطا در ویرایش مشتری');
    }
  };

  const handleDeleteClient = async (clientId: number) => {
    if (!confirm('آیا از حذف این مشتری اطمینان دارید؟')) return;

    // Check if user is logged in before deleting client
    if (!isLoggedIn()) {
      redirectToLogin();
      return;
    }

    try {
      const token = localStorage.getItem('userToken') || localStorage.getItem('token');
      
      if (!token) {
        redirectToLogin();
        return;
      }
      
      const apiPath = process.env.NEXT_PUBLIC_API_PATH || 'http://localhost:5001';
      
      const response = await fetch(`${apiPath}/api/v1/clients/${clientId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      if (response.ok) {
        fetchClients();
        alert('مشتری با موفقیت حذف شد');
      } else {
        const error = await response.json();
        alert(error.error || 'خطا در حذف مشتری');
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('خطا در حذف مشتری');
    }
  };

  const handleViewFiles = async (client: Client) => {
    // Check if user is logged in before viewing files
    if (!isLoggedIn()) {
      redirectToLogin();
      return;
    }

    try {
      const token = localStorage.getItem('userToken') || localStorage.getItem('token');
      
      if (!token) {
        redirectToLogin();
        return;
      }
      
      const apiPath = process.env.NEXT_PUBLIC_API_PATH || 'http://localhost:5001';
      
      const response = await fetch(`${apiPath}/api/v1/clients/${client.id}/files`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setSelectedClient({ ...client, files: data.files });
        setShowFilesModal(true);
      } else {
        alert('خطا در بارگذاری فایل‌ها');
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      alert('خطا در بارگذاری فایل‌ها');
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.phone.includes(searchTerm) ||
                         client.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPropertyType = !propertyTypeFilter || client.propertyType === propertyTypeFilter;
    const matchesCity = !cityFilter || client.city === cityFilter;
    
    return matchesSearch && matchesPropertyType && matchesCity;
  });

  const getPropertyTypeText = (type: string) => {
    const types = {
      'sale': 'فروش',
      'rent': 'اجاره',
      'land': 'زمین',
      'partnership': 'مشارکت'
    };
    return types[type as keyof typeof types] || type;
  };

  const getPropertyTypeColor = (type: string) => {
    const colors = {
      'sale': 'bg-green-100 text-green-800',
      'rent': 'bg-blue-100 text-blue-800',
      'land': 'bg-yellow-100 text-yellow-800',
      'partnership': 'bg-purple-100 text-purple-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // If user is not logged in, show loading or redirect
  if (!isLoggedIn()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">در حال بررسی احراز هویت...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainMenu />
      <SideBar />
      
      <div className="main-content p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">مدیریت مشتریان</h1>
              <p className="text-gray-600 mt-2">مشتریان خود را مدیریت کنید و فایل‌های مرتبط را مشاهده کنید</p>
            </div>
            <button
              onClick={() => {
                if (!isLoggedIn()) {
                  redirectToLogin();
                  return;
                }
                setShowAddModal(true);
              }}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
            >
              <FaPlus />
              افزودن مشتری
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FaUsers className="text-blue-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">کل مشتریان</p>
                  <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FaFolder className="text-green-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">فایل‌های جدید</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {clients.reduce((total, client) => total + (client.files?.filter(f => f.isNew).length || 0), 0)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <FaSearch className="text-yellow-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">فعال</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {clients.filter(c => c.isActive).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FaEye className="text-purple-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">مشاهده شده</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {clients.reduce((total, client) => total + (client.files?.filter(f => f.isRead).length || 0), 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="جستجو در مشتریان..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <select
                  value={propertyTypeFilter}
                  onChange={(e) => setPropertyTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">همه انواع ملک</option>
                  <option value="sale">فروش</option>
                  <option value="rent">اجاره</option>
                  <option value="land">زمین</option>
                  <option value="partnership">مشارکت</option>
                </select>
              </div>
              <div>
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">همه شهرها</option>
                  <option value="تهران">تهران</option>
                  <option value="کرج">کرج</option>
                </select>
              </div>
              <div>
                <button
                  onClick={fetchClients}
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  <FaSearch className="inline mr-2" />
                  جستجو
                </button>
              </div>
            </div>
          </div>

          {/* Clients Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">در حال بارگذاری...</p>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FaUsers className="mx-auto h-12 w-12 mb-4" />
                <p>هیچ مشتری‌ای یافت نشد</p>
                <button
                  onClick={() => {
                    if (!isLoggedIn()) {
                      redirectToLogin();
                      return;
                    }
                    setShowAddModal(true);
                  }}
                  className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  افزودن اولین مشتری
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        نام
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        تلفن
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        نوع ملک
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        متراژ
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        شهر
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        بودجه
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        وضعیت
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        عملیات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredClients.map((client) => (
                      <tr key={client.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                                <span className="text-white font-medium">
                                  {client.name.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="mr-4">
                              <div className="text-sm font-medium text-gray-900">
                                {client.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {client.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {client.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPropertyTypeColor(client.propertyType)}`}>
                            {getPropertyTypeText(client.propertyType)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {client.area}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {client.city}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {client.budget ? `${client.budget.toLocaleString()} تومان` : 'نامشخص'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            client.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {client.isActive ? 'فعال' : 'غیرفعال'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2 space-x-reverse">
                            <button
                              onClick={() => handleViewFiles(client)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="مشاهده فایل‌ها"
                            >
                              <FaFolder />
                            </button>
                            <button
                              onClick={() => {
                                if (!isLoggedIn()) {
                                  redirectToLogin();
                                  return;
                                }
                                setSelectedClient(client);
                                setFormData({
                                  name: client.name,
                                  phone: client.phone,
                                  propertyType: client.propertyType,
                                  area: client.area,
                                  city: client.city,
                                  budget: client.budget?.toString() || '',
                                  description: client.description || ''
                                });
                                setShowEditModal(true);
                              }}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="ویرایش"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteClient(client.id)}
                              className="text-red-600 hover:text-red-900"
                              title="حذف"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-6">افزودن مشتری جدید</h2>
            <form onSubmit={handleAddClient}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    نام کامل
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    تلفن
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    نوع ملک
                  </label>
                  <select
                    required
                    value={formData.propertyType}
                    onChange={(e) => setFormData({...formData, propertyType: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="sale">فروش</option>
                    <option value="rent">اجاره</option>
                    <option value="land">زمین</option>
                    <option value="partnership">مشارکت</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    متراژ
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: 100-150"
                    value={formData.area}
                    onChange={(e) => setFormData({...formData, area: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    شهر
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    بودجه (تومان)
                  </label>
                  <input
                    type="number"
                    placeholder="مثال: 500000000"
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    توضیحات
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 space-x-reverse mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  افزودن مشتری
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {showEditModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-6">ویرایش مشتری</h2>
            <form onSubmit={handleEditClient}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    نام کامل
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    تلفن
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    نوع ملک
                  </label>
                  <select
                    required
                    value={formData.propertyType}
                    onChange={(e) => setFormData({...formData, propertyType: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="sale">فروش</option>
                    <option value="rent">اجاره</option>
                    <option value="land">زمین</option>
                    <option value="partnership">مشارکت</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    متراژ
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: 100-150"
                    value={formData.area}
                    onChange={(e) => setFormData({...formData, area: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    شهر
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    بودجه (تومان)
                  </label>
                  <input
                    type="number"
                    placeholder="مثال: 500000000"
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    توضیحات
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 space-x-reverse mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  ذخیره تغییرات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Files Modal */}
      {showFilesModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">فایل‌های مشتری: {selectedClient.name}</h2>
              <button
                onClick={() => setShowFilesModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            {selectedClient.files && selectedClient.files.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedClient.files.map((file) => (
                  <div key={file.id} className={`border rounded-lg p-4 ${file.isNew ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{file.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(file.createdAt).toLocaleDateString('fa-IR')}
                        </p>
                        <div className="flex gap-2 mt-2">
                          {file.isNew && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              جدید
                            </span>
                          )}
                          {file.isRead && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              خوانده شده
                            </span>
                          )}
                          {file.matchScore && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              امتیاز: {file.matchScore}%
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => window.open(`/files/${file.filename}`, '_blank')}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="دانلود"
                      >
                        <FaEye />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FaFolder className="mx-auto h-12 w-12 mb-4" />
                <p>هیچ فایلی برای این مشتری یافت نشد</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}