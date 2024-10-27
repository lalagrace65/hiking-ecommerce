import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { useNavigate } from "react-router-dom";

export default function CreateStaffAccount() {
    const navigateTo = useNavigate(); 

    const [name, setStaffName] = useState('');
    const [password, setStaffPassword] = useState('');
    const [email, setStaffEmail] = useState('');
    const [address, setAddress] = useState('');
    const [contactNo, setContactNo] = useState('');
    const [role] = useState('staff');
  
    // Error states for each input
    const [errors, setErrors] = useState({});

    function inputHeader(text) {
        return <h2 className="text-2xl mt-4">{text}</h2>;
    }

    function inputDescription(text) {
        return <p className="text-gray-500 text-sm">{text}</p>;
    }

    function preInput(header, description) {
        return (
            <>
                {inputHeader(header)}
                {inputDescription(description)}
            </>
        );
    }

    // Function for sending registration data to API
    async function addNewStaff(ev) {
        ev.preventDefault();
        
        // Validate each field and set error messages if any field is empty
        const newErrors = {};
        if (!name) newErrors.name = 'Username is required';
        if (!email) newErrors.email = 'Email is required';
        if (!password) newErrors.password = 'Password is required';
        if (!address) newErrors.address = 'Address is required';
        if (!contactNo) newErrors.contactNo = 'Phone number is required';

        // Update error state
        setErrors(newErrors);

        // If there are any errors, stop the form submission
        if (Object.keys(newErrors).length > 0) return;

        try {
            await axios.post('http://localhost:4000/create-staff', {
                name,
                email,
                password,
                address,
                contactNo,
                role 
            });
            toast.success('Staff Account Created!');
            navigateTo('/account/staff');
        } catch (e) {
            toast.error("Failed to create staff account");
        }
    }

    return (
        <div className="mt-4 grow flex items-center justify-center">
            <div className="border bg-white shadow-lg rounded-xl p-6 flex gap-8">
                <div className="flex flex-col w-1/2">
                    {preInput('Username', 'Input staff username')}
                    <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="Username"
                        value={name}
                        onChange={ev => setStaffName(ev.target.value)}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    
                    {preInput('Password', 'Input staff password')}
                    <input
                        type="password"
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="Password"
                        value={password}
                        onChange={ev => setStaffPassword(ev.target.value)}
                    />
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                <div className="flex-grow w-1/2">
                    {preInput('Email', 'Input staff email')}
                    <input
                        type="email"
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="your@email.com"
                        value={email}
                        onChange={ev => setStaffEmail(ev.target.value)}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}

                    {preInput('Address', 'Input staff address')}
                    <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="(street, city, province)"
                        value={address}
                        onChange={ev => setAddress(ev.target.value)}
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}

                    {preInput('Phone number', 'Input staff phone number')}
                    <PhoneInput
                        className="phone-input-container mt-2 mb-2 w-full px-3 py-2 border border-gray-300 rounded-2xl"
                        international
                        countryCallingCodeEditable={false}
                        defaultCountry="PH"
                        placeholder="Enter phone number"
                        value={contactNo}
                        onChange={setContactNo}
                    />
                    {errors.contactNo && <p className="text-red-500 text-sm mt-1">{errors.contactNo}</p>}

                    <button onClick={addNewStaff} className="w-full p-2 bg-primary text-white rounded-2xl"> Register </button>
                </div>
            </div>
        </div>
    );
}
