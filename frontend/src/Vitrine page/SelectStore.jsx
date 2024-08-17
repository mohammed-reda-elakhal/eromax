import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectStoreClient } from '../redux/apiCalls/authApiCall';

const SelectStore = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, stores } = useSelector(state => state.auth);

    const handleSelectStore = (storeId) => {
        // Ensure user and user._id are defined
        if (user && (user._id || user.user?._id)) {
            const userId = user._id || user.user._id; // Determine the correct user ID
            
            console.log(userId, storeId);
            
            dispatch(selectStoreClient(userId, storeId, navigate));
        } else {
            console.error("User or user._id is undefined");
        }
    };

    return (
        <div>
            <h1>Select Store</h1>
            {stores.length > 0 ? (
                stores.map(store => (
                    <button key={store.id} onClick={() => handleSelectStore(store.id)}>
                        {store.storeName}
                    </button>
                ))
            ) : (
                <p>No stores available.</p>
            )}
        </div>
    );
};

export default SelectStore;
