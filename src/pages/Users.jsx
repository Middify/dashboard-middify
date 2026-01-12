import React from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import UsersTable from '../components/users/UsersTable';
import CreateUsers from '../components/users/CreateUsers';

const Users = () => {
    const { token, authorizedTenants, user, selectedTenantId } = useOutletContext();
    const [searchParams] = useSearchParams();
    const view = searchParams.get('view') || 'list';

    const userRole = user?.role?.toLowerCase() || '';
    const canCreateUser = userRole === 'middifyadmin';

    return (
        <div className="mt-8 mx-auto w-full">
            {view === 'create' && canCreateUser ? (
                <CreateUsers />
            ) : (
                <UsersTable 
                    token={token} 
                    allTenants={authorizedTenants || []} 
                    selectedTenantId={selectedTenantId}
                />
            )}
        </div>
    );
};

export default Users;
