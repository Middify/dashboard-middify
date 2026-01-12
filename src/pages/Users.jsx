import React from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import UsersTable from '../components/users/UsersTable';
import CreateUsers from '../components/users/CreateUsers';

const Users = () => {
    const { token } = useOutletContext();
    const [searchParams] = useSearchParams();
    const view = searchParams.get('view') || 'list';

    return (
        <div className="mt-8 mx-auto w-full">
            {view === 'create' ? (
                <CreateUsers />
            ) : (
                <UsersTable token={token} />
            )}
        </div>
    );
};

export default Users;
