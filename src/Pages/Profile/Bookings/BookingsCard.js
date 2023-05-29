import React, { useEffect, useState } from 'react';

import { useAuthState } from 'react-firebase-hooks/auth';
import auth from '../../../Utilities/firebase.init';
import './Booking.css';
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import { useAddServiceToDbMutation, useDeleteServiceMutation, useDeletingAServiceMutation, useGetServiceCartQuery, useUpdateServiceMutation } from '../../../Redux/Features/service/serviceApi';

const BookingsCard = ({ index }) => {

    const { serviceId, packageCatagory, packageCatagoryName, cameraMan, duration, thumbImg, price, status } = index;

    // --- getting user info from firebase
    const [user] = useAuthState(auth);

    const [time, setTime] = useState('Afternoon')

    // --- custom error message 
    let errMsg = (msg) => toast.error(msg || 'There was an error doing the operation !', {
        position: "bottom-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
    });
    let successMsg = (msg) => toast.success(msg, {
        position: "bottom-center",
        autoClose: 1000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
    });

    // --- updating a bookings from 'pending' to 'confirmed' 
    const [date, setDate] = useState('');
    // --- getting current date 
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;


    // --- deleting a bookings from db
    // const [deleteService] = useDeleteServiceMutation();
    const [deleteAservice, { data, isLoading, isError, error, isSuccess }] = useDeletingAServiceMutation();

    const handleDelete = (id) => {
        const isConfirm = window.confirm('Delete this booking ? ');
        if (isConfirm) {
            deleteAservice({ id: index._id, email: user?.email });
        }
    }

    // --- deciding what to show in UI while deleting the data from server

    if (isError) {
        console.log('Error happened !');
        errMsg(error.error || 'There was an error deleting the item !')
    }
    if (data?.deletedCount > 0) {
        console.log('Deleted');
        successMsg('Deleted Successfully !')
    }
    if (isLoading) {
        console.log('Loading ... ');
    }

    // --- booking a service & adding it to database
    const [addService, { data: updateService, isLoading: updateLoading, isError: updateIsError, error: updateError }] = useAddServiceToDbMutation();

    const [confirmUpdate] = useUpdateServiceMutation();

    const handleUpdate = (id) => {
        let selectedDateId = document.getElementById(`${id}`);
        let selectedDate = selectedDateId.value;

        if (!selectedDate) {
            errMsg('Please Select Date First !')
        } else {
            if (formattedDate > selectedDate) {
                errMsg("You can't select Date before Today !");
            } else if (formattedDate == selectedDate) {
                errMsg("You can't select Today !");
            } else {
                // addService({ email: user.email, serviceId, packageCatagory, packageCatagoryName, cameraMan, duration, thumbImg, price, time, date: selectedDate, status: 'confirmed' });
                confirmUpdate({ email: user.email, serviceId, time, date: selectedDate, status: 'confirmed' })
            }
        }
    }


    useEffect(() => {
        if (updateLoading && !updateIsError) {
            // setButtonText('Adding...');
            console.log('Updating...')
        }
        else if (!updateLoading && updateIsError) {
            console.log('Error happened: ', updateError);
            // setButtonText('Add to Booking');
        }
        else if (updateService) {
            if (updateService.acknowledged) {
                console.log(updateService);
            }
        }
    }, [updateService, updateLoading, updateIsError, updateError?.error, updateError])


    return (
        <tr key={index._id} className='table-row' >
            <td className='first-td'>
                <img src={index.thumbImg} alt="" /> {index.packageCatagoryName}
            </td>
            <td className='booking-time'>
                <input type="date" id={index._id} />
            </td>
            <td className='booking-time'>
                <select name="" id="" onChange={e => setTime(e.target.value)} defaultValue={time}>
                    <option value="Morning">Monrning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Night">Night</option>
                </select>
            </td>
            <td className='booking-price'>
                $ {index.price}
            </td>
            <td className='booking-pending'>
                {index?.status || 'Pending'}
            </td>
            <td className='booking-decision'>
                {isLoading ? <div className="loader-in-middle2"><ClipLoader size={30} color={'black'} /></div> : <><button onClick={() => handleUpdate(index._id)}>Confirm</button><button onClick={() => handleDelete(index._id)}>Delete</button></>}
            </td>
        </tr>
    );
};

export default BookingsCard;