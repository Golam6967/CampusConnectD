import { useEffect, useState, useMemo } from 'react'
import { Users, Droplet, Phone, MapPin, Clock, ToggleLeft, ToggleRight, Filter, Edit,LoaderIcon } from 'lucide-react'
import AddDonorModal from './modals/AddDonorModal'
import RequestBloodModal from './modals/RequestBloodModal'
import Loading from '../../../components/Loading'
import { AuthContext } from '../../../context/AuthContext'
import { useDonorContext } from '../../../context/DonorContext'

export default function BloodBank() {
    const { User } = AuthContext();
    const currentUserEmail = User?.email || User?.user?.email;

    const {
        donors, 
        isRegisteredDonor,
        donorLoading,
        donorError,
        fetchDonorsAndCheckStatus,
        toggleDonorStatus,
    } = useDonorContext(); 
    
    // 1. Local State for Display Array (Filtering target)
    const [displayedDonors, setDisplayedDonors] = useState([]);
    
    // 2. New State for Modal/Update Data
    const [donorToEdit, setDonorToEdit] = useState(null);

    // Calculate isActive status safely and get the current user's full donor object
    const currentUserDonor = useMemo(() => {
        return donors.find(donor => (donor.email || donor.user?.email || donor.contact?.email) === currentUserEmail);
    }, [donors, currentUserEmail]);

    const isActive = currentUserDonor?.isActive;

    const [showDonorModal, setShowDonorModal] = useState(false)
    const [showRequestModal, setShowRequestModal] = useState(false)
    
    // Filter States
    const [selectedBloodGroup, setSelectedBloodGroup] = useState('all');
    const [searchLocation, setSearchLocation] = useState('');
    const bloodGroups = ['all', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    // Initial Data Fetch 
    useEffect(() => {
        if (currentUserEmail) {
            fetchDonorsAndCheckStatus()
        }
    }, [currentUserEmail, fetchDonorsAndCheckStatus])

    // Filter Logic
    useEffect(() => {
        const filteredList = donors.filter(donor => {
            const locationMatch = donor.location 
                ? donor.location.toLowerCase().includes(searchLocation.toLowerCase())
                : true; 
                
            const bloodGroupMatch = selectedBloodGroup === 'all' || donor.blood_group === selectedBloodGroup;
            
            const isCurrentUser = (donor.email || donor.user_name || donor.contact?.email) === currentUserEmail;

            const isAvailableOrIsUser = donor.isActive || isCurrentUser;
            
            return locationMatch && bloodGroupMatch && isAvailableOrIsUser;
        });

        setDisplayedDonors(filteredList);
    }, [donors, selectedBloodGroup, searchLocation, currentUserEmail]);

    const handleToggleStatus = async () => {
        try {
            await toggleDonorStatus(); 
        } catch (error) {
            console.error("Failed to toggle status:", error.message);
        }
    };
    
    // 3. Update Modal Handler
    const handleUpdateClick = () => {
        // Find the current user's data and set it for editing
        if (currentUserDonor) {
            setDonorToEdit(currentUserDonor);
            setShowDonorModal(true);
        }
    };
    
    // Reset edit state when closing the modal
    const handleCloseDonorModal = () => {
        setDonorToEdit(null);
        setShowDonorModal(false);
    };

    if (donorLoading && !donors.length) {
        return <Loading text="Loading donor data" />;
    }
    if (donorError) {
        return <div className="text-center py-10 text-red-600 font-semibold">Error: {donorError}</div>;
    }


    return (
        <>
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">Blood Donation Portal</h2>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        {!isRegisteredDonor ? (
                            <button
                                onClick={() => setShowDonorModal(true)}
                                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#e50914] to-[#b00020] px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl"
                            >
                                <Users className="h-5 w-5" />
                                Be a Donor
                            </button>
                        ) : (
                            // New: Update Profile button next to Request Blood button for registered donors
                            <button
                                onClick={handleUpdateClick}
                                className="inline-flex items-center gap-2 rounded-full border-2 border-red-500 bg-white px-6 py-3 font-semibold text-red-500 transition hover:bg-red-600 hover:text-white"
                            >
                                <Edit className="h-5 w-5" />
                                Update Profile
                            </button>
                        )}

                        <button
                            onClick={() => setShowRequestModal(true)}
                            className="inline-flex items-center gap-2 rounded-full border-2 border-[#e50914] bg-white px-6 py-3 font-semibold text-[#e50914] transition hover:bg-[#e50914] hover:text-white"
                        >
                            <Droplet className="h-5 w-5" />
                            Request Blood
                        </button>
                    </div>
                </div>

                {/* --- FILTER SECTION --- */}
                <div className="rounded-2xl bg-white p-6 shadow-md flex flex-col sm:flex-row gap-4 sm:gap-6 items-center">
                    <Filter className="h-5 w-5 text-gray-500" />
                    
                    {/* Location Search Input */}
                    <div className="w-full sm:w-1/3">
                        <input
                            type="text"
                            placeholder="Search city or area..."
                            value={searchLocation}
                            onChange={(e) => setSearchLocation(e.target.value)}
                            className="w-full rounded-lg text-black bg-gray-300 border border-gray-300 px-4 py-2 text-sm focus:border-[#e50914] focus:outline-none focus:ring-2 focus:ring-[#e50914]/20"
                        />
                    </div>
                    
                    {/* Blood Group Filter */}
                    <div className="w-full sm:w-1/3">
                        <select
                            value={selectedBloodGroup}
                            onChange={(e) => setSelectedBloodGroup(e.target.value)}
                            className="w-full rounded-lg text-black bg-gray-300 border border-gray-300 px-4 py-2 text-sm focus:border-[#e50914] focus:outline-none focus:ring-2 focus:ring-[#e50914]/20"
                        >
                            {bloodGroups.map(group => (
                                <option key={group} value={group}>
                                    {group === 'all' ? 'All Blood Groups' : group}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <span className="text-sm text-gray-500 hidden sm:block">
                        {displayedDonors.length} found
                    </span>
                </div>
                {/* --- END FILTER SECTION --- */}
                
                <span className="text-sm text-gray-500 sm:hidden block">
                    {displayedDonors.length} donors found
                </span>


                {/* DONOR GRID */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {displayedDonors.length === 0 ? (
                        <div className="sm:col-span-2 lg:col-span-4 rounded-2xl bg-white p-12 text-center shadow-lg">
                            <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                            <p className="text-lg text-gray-600">No donors match your search criteria.</p>
                        </div>
                    ) : (
                        displayedDonors.map((donor) => { 
                            const isCurrentUser = (donor.email || donor.user_name || donor.contact?.email) === currentUserEmail;

                            return (
                                <div
                                    key={donor.donor_id || donor.id}
                                    className="rounded-2xl bg-white p-6 shadow-lg transition hover:shadow-xl"
                                >
                                    <div className="mb-4 flex items-center justify-between">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#e50914] to-[#b00020] text-white">
                                            <span className="text-2xl font-bold">{donor.blood_group}</span>
                                        </div>
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${donor.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            {donor.isActive ? 'Available' : 'Inactive'}
                                        </span>
                                    </div>
                                    <h3 className="mb-3 text-lg font-bold text-gray-800">{donor.user_name}</h3>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            <span>{donor.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            <span>{donor.phone_number}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            <span>Last: {donor.last_donated ? new Date(donor.last_donated).toLocaleDateString() : 'N/A'}</span>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    {isCurrentUser ? (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleUpdateClick}
                                                className="mt-4 w-1/3 rounded-full py-2 text-sm font-semibold text-white transition hover:shadow-lg flex items-center justify-center gap-1 bg-blue-500 hover:bg-blue-600"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            
                                            {/* Toggle Status Button */}
                                            <button
                                                onClick={handleToggleStatus}
                                                className={`mt-4 w-2/3 rounded-full py-2 text-sm font-semibold text-white transition hover:shadow-lg flex items-center justify-center gap-2 ${donor.isActive
                                                        ? 'bg-green-500 hover:bg-green-600'
                                                        : 'bg-red-500 hover:bg-red-600'
                                                    }`}
                                            >
                                                {!donorLoading ? (donor.isActive ? 'Set Inactive' : 'Set Active') : (<h1 className='rotate'><LoaderIcon /></h1>)}
                                            </button>
                                        </div>
                                    ) : (
                                        donor.isActive && (
                                            <button onClick={()=>{}} className="mt-4 w-full rounded-full bg-gradient-to-r from-[#e50914] to-[#b00020] py-2 text-sm font-semibold text-white transition hover:shadow-lg">
                                                Contact Donor
                                            </button>
                                        )
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* BOTTOM BANNER */}
                <div className="mt-8 rounded-2xl bg-gradient-to-br from-red-50 to-pink-50 p-8 text-center shadow-lg">
                    <Droplet className="mx-auto mb-4 h-12 w-12 text-[#e50914]" />
                    <h3 className="mb-2 text-xl font-bold text-gray-800">
                        {isRegisteredDonor
                            ? `Thank you for being a registered donor! Your profile is ${isActive ? 'Active' : 'Inactive'}.`
                            : "Click the 'Be a Donor' button to register and help save lives."
                        }
                    </h3>
                    <p className="text-gray-600">Help save lives by registering as a blood donor today.</p>
                </div>
            </div>

            {/* Pass donorToEdit to the modal */}
            <AddDonorModal
                isOpen={showDonorModal}
                onClose={handleCloseDonorModal}
                donorToEdit={donorToEdit} // <-- Pass the data to be pre-filled
                onSubmit={fetchDonorsAndCheckStatus}
            />
            <RequestBloodModal
                isOpen={showRequestModal}
                onClose={() => setShowRequestModal(false)}
            />
        </>
    );
}