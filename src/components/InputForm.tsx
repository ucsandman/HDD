import { useState, useEffect, type FormEvent } from 'react';
import type { FormData } from '../types';
import { PROJECT_TYPES } from '../types';

interface InputFormProps {
  onSubmit: (data: FormData) => void;
}

const STORAGE_KEY = 'hdd-review-generator-form';

function loadPersistedData(): Partial<FormData> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // localStorage unavailable or parse error
  }
  return {};
}

function persistData(data: Partial<FormData>) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        franchiseeName: data.franchiseeName,
        googleReviewLink: data.googleReviewLink,
      })
    );
  } catch {
    // localStorage unavailable
  }
}

export function InputForm({ onSubmit }: InputFormProps) {
  const [formData, setFormData] = useState<FormData>(() => {
    const persisted = loadPersistedData();
    return {
      customerFirstName: '',
      customerLastName: '',
      projectType: '',
      city: '',
      franchiseeName: persisted.franchiseeName || '',
      googleReviewLink: persisted.googleReviewLink || '',
    };
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});

  // Persist franchisee name and review link when they change
  const { franchiseeName, googleReviewLink } = formData;
  useEffect(() => {
    persistData({ franchiseeName, googleReviewLink });
  }, [franchiseeName, googleReviewLink]);

  const validateField = (name: keyof FormData, value: string): string | undefined => {
    switch (name) {
      case 'customerFirstName':
        return value.length < 1 ? 'First name is required' : undefined;
      case 'customerLastName':
        return value.length < 1 ? 'Last name is required' : undefined;
      case 'projectType':
        return !value ? 'Please select a project type' : undefined;
      case 'city':
        return value.length < 2 ? 'City must be at least 2 characters' : undefined;
      case 'franchiseeName':
        return value.length < 1 ? 'Franchisee name is required' : undefined;
      case 'googleReviewLink':
        if (!value) return 'Google Review link is required';
        try {
          new URL(value);
          return undefined;
        } catch {
          return 'Please enter a valid URL';
        }
      default:
        return undefined;
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name as keyof FormData]) {
      const error = validateField(name as keyof FormData, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name as keyof FormData, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    let hasErrors = false;

    (Object.keys(formData) as Array<keyof FormData>).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    setTouched({
      customerFirstName: true,
      customerLastName: true,
      projectType: true,
      city: true,
      franchiseeName: true,
      googleReviewLink: true,
    });

    if (!hasErrors) {
      onSubmit(formData);
    }
  };

  const isFormValid = Object.keys(formData).every(
    (key) => !validateField(key as keyof FormData, formData[key as keyof FormData])
  );

  const inputClasses = (fieldName: keyof FormData) => `
    w-full px-3 py-2 border rounded-lg text-slate-800
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    ${errors[fieldName] && touched[fieldName] ? 'border-red-500' : 'border-slate-300'}
  `;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="customerFirstName"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Customer First Name
          </label>
          <input
            type="text"
            id="customerFirstName"
            name="customerFirstName"
            value={formData.customerFirstName}
            onChange={handleChange}
            onBlur={handleBlur}
            className={inputClasses('customerFirstName')}
            placeholder="John"
          />
          {errors.customerFirstName && touched.customerFirstName && (
            <p className="mt-1 text-sm text-red-500">{errors.customerFirstName}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="customerLastName"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Customer Last Name
          </label>
          <input
            type="text"
            id="customerLastName"
            name="customerLastName"
            value={formData.customerLastName}
            onChange={handleChange}
            onBlur={handleBlur}
            className={inputClasses('customerLastName')}
            placeholder="Smith"
          />
          {errors.customerLastName && touched.customerLastName && (
            <p className="mt-1 text-sm text-red-500">{errors.customerLastName}</p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="projectType"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Project Type
        </label>
        <select
          id="projectType"
          name="projectType"
          value={formData.projectType}
          onChange={handleChange}
          onBlur={handleBlur}
          className={inputClasses('projectType')}
        >
          <option value="">Select a project type...</option>
          {PROJECT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        {errors.projectType && touched.projectType && (
          <p className="mt-1 text-sm text-red-500">{errors.projectType}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="city"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          City
        </label>
        <input
          type="text"
          id="city"
          name="city"
          value={formData.city}
          onChange={handleChange}
          onBlur={handleBlur}
          className={inputClasses('city')}
          placeholder="Toronto"
        />
        {errors.city && touched.city && (
          <p className="mt-1 text-sm text-red-500">{errors.city}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="franchiseeName"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Franchisee First Name
        </label>
        <input
          type="text"
          id="franchiseeName"
          name="franchiseeName"
          value={formData.franchiseeName}
          onChange={handleChange}
          onBlur={handleBlur}
          className={inputClasses('franchiseeName')}
          placeholder="Mike"
        />
        {errors.franchiseeName && touched.franchiseeName && (
          <p className="mt-1 text-sm text-red-500">{errors.franchiseeName}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="googleReviewLink"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Google Review Link
        </label>
        <input
          type="url"
          id="googleReviewLink"
          name="googleReviewLink"
          value={formData.googleReviewLink}
          onChange={handleChange}
          onBlur={handleBlur}
          className={inputClasses('googleReviewLink')}
          placeholder="https://g.page/r/..."
        />
        {errors.googleReviewLink && touched.googleReviewLink && (
          <p className="mt-1 text-sm text-red-500">{errors.googleReviewLink}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={!isFormValid}
        className={`
          w-full py-3 px-4 rounded-lg font-medium text-white
          transition-colors duration-200
          ${
            isFormValid
              ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
              : 'bg-slate-300 cursor-not-allowed'
          }
        `}
      >
        Generate Messages
      </button>
    </form>
  );
}
