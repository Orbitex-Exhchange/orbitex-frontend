"use client";

import { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Upload,
  Camera,
  FileText,
  Shield,
  CheckCircle,
  AlertCircle,
  User,
  MapPin,
  Calendar,
  Phone,
  Mail
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface KYCFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  country: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  email: string;
  documentType: string;
  documentNumber: string;
  documentCountry: string;
  documentExpiry: string;
}

interface DocumentUpload {
  type: string;
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
}

function KYCContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [kycLevel, setKycLevel] = useState(0);

  const [formData, setFormData] = useState<KYCFormData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: '',
    country: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
    email: '',
    documentType: 'passport',
    documentNumber: '',
    documentCountry: '',
    documentExpiry: '',
  });

  const [documents, setDocuments] = useState<DocumentUpload[]>([]);

  useEffect(() => {
    // Load user data if available
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          const authServiceUrl = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'https://orbitex-auth-service-976099405307.us-central1.run.app';
          const response = await fetch(`${authServiceUrl}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const userData = await response.json();
            setFormData(prev => ({
              ...prev,
              firstName: userData.first_name || '',
              lastName: userData.last_name || '',
              email: userData.email || '',
              phone: userData.phone || '',
            }));
            setKycLevel(userData.level || 0);
          }
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };

    loadUserData();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileUpload = (type: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      const newDocument: DocumentUpload = {
        type,
        file,
        preview,
        status: 'pending',
      };
      setDocuments(prev => [...prev, newDocument]);
    };
    reader.readAsDataURL(file);
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
      if (!formData.nationality) newErrors.nationality = 'Nationality is required';
      if (!formData.country) newErrors.country = 'Country is required';
    }

    if (step === 2) {
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.state.trim()) newErrors.state = 'State/Province is required';
      if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    }

    if (step === 3) {
      if (!formData.documentNumber.trim()) newErrors.documentNumber = 'Document number is required';
      if (!formData.documentCountry) newErrors.documentCountry = 'Document country is required';
      if (!formData.documentExpiry) newErrors.documentExpiry = 'Document expiry date is required';
      
      const requiredDocs = ['identity', 'selfie'];
      const uploadedDocs = documents.map(d => d.type);
      const missingDocs = requiredDocs.filter(doc => !uploadedDocs.includes(doc));
      
      if (missingDocs.length > 0) {
        newErrors.documents = `Please upload: ${missingDocs.join(', ')}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsLoading(true);
    setErrors({});

    try {
      const token = localStorage.getItem('auth_token');
      const authServiceUrl = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'https://orbitex-auth-service-976099405307.us-central1.run.app';

      // Upload documents first
      const documentUploads = await Promise.all(
        documents.map(async (doc) => {
          const formData = new FormData();
          formData.append('file', doc.file);
          formData.append('type', doc.type);

          const response = await fetch(`${authServiceUrl}/kyc/upload-document`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Failed to upload ${doc.type}`);
          }

          return response.json();
        })
      );

      // Submit KYC application
      const response = await fetch(`${authServiceUrl}/kyc/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          personal_info: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            date_of_birth: formData.dateOfBirth,
            nationality: formData.nationality,
            country: formData.country,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            postal_code: formData.postalCode,
            phone: formData.phone,
            email: formData.email,
          },
          document_info: {
            type: formData.documentType,
            number: formData.documentNumber,
            country: formData.documentCountry,
            expiry_date: formData.documentExpiry,
          },
          documents: documentUploads,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'KYC submission failed');
      }

      setSuccess(true);
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);

    } catch (error: any) {
      console.error('KYC submission failed:', error);
      setErrors({ 
        general: error.message || 'KYC submission failed. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h2 className="mt-4 text-xl font-semibold text-gray-900">
                KYC Application Submitted!
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Your KYC application has been submitted successfully. We will review your documents and update your verification status within 24-48 hours.
              </p>
              <div className="mt-6">
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="w-full"
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Identity Verification</h1>
          <p className="mt-2 text-gray-600">
            Complete your verification to unlock higher trading limits and features
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Personal Info</span>
            <span>Address</span>
            <span>Documents</span>
          </div>
        </div>

        {/* Current KYC Level */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-blue-800">
              Current Level: {kycLevel} • Target Level: 3
            </span>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white shadow rounded-lg p-6">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{errors.general}</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={`pl-10 ${errors.firstName ? 'border-red-500' : ''}`}
                      placeholder="First name"
                    />
                  </div>
                  {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={`pl-10 ${errors.lastName ? 'border-red-500' : ''}`}
                      placeholder="Last name"
                    />
                  </div>
                  {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className={errors.dateOfBirth ? 'border-red-500' : ''}
                  />
                  {errors.dateOfBirth && <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Nationality</label>
                  <select
                    value={formData.nationality}
                    onChange={(e) => handleInputChange('nationality', e.target.value)}
                    className={`block w-full border border-gray-300 rounded-md px-3 py-2 ${errors.nationality ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select nationality</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="JP">Japan</option>
                    <option value="AU">Australia</option>
                    <option value="SG">Singapore</option>
                    <option value="HK">Hong Kong</option>
                    <option value="KR">South Korea</option>
                  </select>
                  {errors.nationality && <p className="mt-1 text-sm text-red-600">{errors.nationality}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Country of Residence</label>
                <select
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className={`block w-full border border-gray-300 rounded-md px-3 py-2 ${errors.country ? 'border-red-500' : ''}`}
                >
                  <option value="">Select country</option>
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="JP">Japan</option>
                  <option value="AU">Australia</option>
                  <option value="SG">Singapore</option>
                  <option value="HK">Hong Kong</option>
                  <option value="KR">South Korea</option>
                </select>
                {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country}</p>}
              </div>
            </div>
          )}

          {/* Step 2: Address Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Address Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Street Address</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={`pl-10 ${errors.address ? 'border-red-500' : ''}`}
                    placeholder="Street address"
                  />
                </div>
                {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <Input
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className={errors.city ? 'border-red-500' : ''}
                    placeholder="City"
                  />
                  {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">State/Province</label>
                  <Input
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className={errors.state ? 'border-red-500' : ''}
                    placeholder="State/Province"
                  />
                  {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                  <Input
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    className={errors.postalCode ? 'border-red-500' : ''}
                    placeholder="Postal code"
                  />
                  {errors.postalCode && <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Document Upload */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Document Verification</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Document Type</label>
                  <select
                    value={formData.documentType}
                    onChange={(e) => handleInputChange('documentType', e.target.value)}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="passport">Passport</option>
                    <option value="national_id">National ID</option>
                    <option value="drivers_license">Driver's License</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Document Number</label>
                  <Input
                    value={formData.documentNumber}
                    onChange={(e) => handleInputChange('documentNumber', e.target.value)}
                    className={errors.documentNumber ? 'border-red-500' : ''}
                    placeholder="Document number"
                  />
                  {errors.documentNumber && <p className="mt-1 text-sm text-red-600">{errors.documentNumber}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Document Country</label>
                  <select
                    value={formData.documentCountry}
                    onChange={(e) => handleInputChange('documentCountry', e.target.value)}
                    className={`block w-full border border-gray-300 rounded-md px-3 py-2 ${errors.documentCountry ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select country</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="JP">Japan</option>
                    <option value="AU">Australia</option>
                    <option value="SG">Singapore</option>
                    <option value="HK">Hong Kong</option>
                    <option value="KR">South Korea</option>
                  </select>
                  {errors.documentCountry && <p className="mt-1 text-sm text-red-600">{errors.documentCountry}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                  <Input
                    type="date"
                    value={formData.documentExpiry}
                    onChange={(e) => handleInputChange('documentExpiry', e.target.value)}
                    className={errors.documentExpiry ? 'border-red-500' : ''}
                  />
                  {errors.documentExpiry && <p className="mt-1 text-sm text-red-600">{errors.documentExpiry}</p>}
                </div>
              </div>

              {/* Document Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Upload Documents</label>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Identity Document */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Identity Document</h3>
                    <p className="mt-1 text-xs text-gray-500">Passport, National ID, or Driver's License</p>
                    <div className="mt-4">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload('identity', file);
                        }}
                        className="hidden"
                        id="identity-upload"
                      />
                      <label htmlFor="identity-upload">
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </Button>
                      </label>
                    </div>
                  </div>

                  {/* Selfie */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Camera className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Selfie</h3>
                    <p className="mt-1 text-xs text-gray-500">Photo of yourself holding your ID</p>
                    <div className="mt-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload('selfie', file);
                        }}
                        className="hidden"
                        id="selfie-upload"
                      />
                      <label htmlFor="selfie-upload">
                        <Button variant="outline" size="sm">
                          <Camera className="h-4 w-4 mr-2" />
                          Take Photo
                        </Button>
                      </label>
                    </div>
                  </div>
                </div>

                {errors.documents && (
                  <p className="mt-2 text-sm text-red-600">{errors.documents}</p>
                )}

                {/* Uploaded Documents Preview */}
                {documents.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Uploaded Documents</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {documents.map((doc, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium capitalize">{doc.type}</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              doc.status === 'success' ? 'bg-green-100 text-green-800' :
                              doc.status === 'error' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {doc.status}
                            </span>
                          </div>
                          <img src={doc.preview} alt={doc.type} className="mt-2 w-full h-32 object-cover rounded" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevStep}
              disabled={currentStep === 1}
            >
              Previous
            </Button>

            {currentStep < 3 ? (
              <Button onClick={handleNextStep}>
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  'Submit KYC Application'
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KYCFallback() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Identity Verification</h1>
          <p className="mt-2 text-gray-600">
            Loading verification page...
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function KYCPage() {
  return (
    <Suspense fallback={<KYCFallback />}>
      <KYCContent />
    </Suspense>
  );
}
