import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import UsersTable from '../components/users/UsersTable';
import * as api from '../api/users/getUsersList';

// Mock de la API
vi.mock('../api/users/getUsersList');

const mockUsers = [
    {
        _id: "1",
        email: "test1@example.com",
        role: "SuperAdmin",
        tenant: [{ tenantId: "t1", tenantName: "Tienda 1" }]
    },
    {
        _id: "2",
        email: "test2@example.com",
        role: "User",
        tenant: []
    }
];

describe('UsersTable Component', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('debe mostrar el loader inicialmente', () => {
        api.getUsersList.mockImplementation(() => new Promise(() => {})); // Promesa pendiente
        render(<UsersTable token="fake-token" />);
        expect(screen.getByText(/cargando usuarios/i)).toBeInTheDocument();
    });

    it('debe renderizar la lista de usuarios correctamente', async () => {
        api.getUsersList.mockResolvedValue({
            users: mockUsers,
            count: 2,
            totalPages: 1,
            page: 1
        });

        render(<UsersTable token="fake-token" />);

        await waitFor(() => {
            expect(screen.getByText('test1@example.com')).toBeInTheDocument();
            expect(screen.getByText('test2@example.com')).toBeInTheDocument();
            expect(screen.getByText('Tienda 1')).toBeInTheDocument();
            expect(screen.getByText('SuperAdmin')).toBeInTheDocument();
        });
    });

    it('debe manejar el caso sin usuarios', async () => {
        api.getUsersList.mockResolvedValue({
            users: [],
            count: 0,
            totalPages: 1,
            page: 1
        });

        render(<UsersTable token="fake-token" />);

        await waitFor(() => {
            // Verifica que el loader desaparezca y muestre estado vacío (o simplemente tabla vacía)
            // En tu implementación actual, si users.length === 0, muestra un spinner si loading es true,
            // pero si loading es false y users es [], muestra la tabla vacía.
            // Verifiquemos que la tabla esté presente
            expect(screen.getByRole('table')).toBeInTheDocument();
            expect(screen.queryByText('test1@example.com')).not.toBeInTheDocument();
        });
    });
});

