"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Types (simplified for frontend)
interface Child {
    id: string;
    name: string;
    birth_date: string;
    group: string; // Simplification, in backend it's enum
    current_kindergarten?: {
        name: string;
        address: string;
    };
    wishlists?: {
        wish_kindergarten_id: string;
    }[];
}

interface User {
    id: string;
    email: string;
    full_name: string;
    children: Child[];
}

interface Kindergarten {
    id: string;
    name: string;
    address: string;
}

const ChildTabContent = ({ child }: { child: Child }) => {
    const [matches, setMatches] = useState<Kindergarten[]>([]);
    const [potentials, setPotentials] = useState<any[]>([]); // Adjust type as needed
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            try {
                // Fetch matches
                const matchesRes = await fetch('http://localhost:3001/matching/check-matches', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ childId: child.id })
                });

                if (matchesRes.ok) {
                    setMatches(await matchesRes.json());
                }

                // Fetch potentials (Note: API takes ageGroup string)
                // Assuming child.group matches the enum string expected by backend
                if (child.group) {
                    const potentialRes = await fetch(`http://localhost:3001/matching/potential?ageGroup=${child.group}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (potentialRes.ok) {
                        setPotentials(await potentialRes.json());
                    }
                }

            } catch (error) {
                console.error("Error fetching child data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [child]);

    if (loading) return <div>Loading child data...</div>;

    return (
        <div className="space-y-4">
            <div className="border p-4 rounded-md">
                <h3 className="font-medium">Current Kindergarten</h3>
                {child.current_kindergarten ? (
                    <p>{child.current_kindergarten.name} ({child.current_kindergarten.address})</p>
                ) : (
                    <p className="text-gray-500">Not assigned</p>
                )}
            </div>

            <div className="border p-4 rounded-md">
                <h3 className="font-medium">Wishes</h3>
                {child.wishlists && child.wishlists.length > 0 ? (
                    <ul className="list-disc pl-5">
                        {child.wishlists.map((wish, index) => (
                            <li key={index}>Kindergarten ID: {wish.wish_kindergarten_id}</li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">No wishes set.</p>
                )}
            </div>

            <div className="border p-4 rounded-md">
                <h3 className="font-medium">Direct Matches (Can switch immediately)</h3>
                {matches.length > 0 ? (
                    <ul className="list-disc pl-5">
                        {matches.map(m => (
                            <li key={m.id}>{m.name} - {m.address}</li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">No direct matches found.</p>
                )}
            </div>

            <div className="border p-4 rounded-md">
                <h3 className="font-medium">Potential Kindergartens (Circular/Complex)</h3>
                {potentials.length > 0 ? (
                    <div className="text-sm">
                        {/* Displaying raw data as potentials structure might vary */}
                        <pre>{JSON.stringify(potentials, null, 2)}</pre>
                    </div>
                ) : (
                    <p className="text-gray-500">No potential matches found.</p>
                )}
            </div>
        </div>
    );
};

export default function Dashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                const res = await fetch('http://localhost:3001/users/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!res.ok) {
                    throw new Error('Failed to fetch user');
                }

                const data = await res.json();
                setUser(data);
            } catch (error) {
                console.error(error);
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [router]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (!user) {
        return null; // Should redirect
    }

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-2">Profile</h2>
                <p><strong>Name:</strong> {user.full_name}</p>
                <p><strong>Email:</strong> {user.email}</p>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">My Children</h2>
                {user.children.length === 0 ? (
                    <p>No children registered.</p>
                ) : (
                    <Tabs defaultValue={user.children[0].id} className="w-full">
                        <TabsList className="mb-4">
                            {user.children.map((child) => (
                                <TabsTrigger key={child.id} value={child.id}>
                                    {child.name}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        {user.children.map((child) => (
                            <TabsContent key={child.id} value={child.id}>
                                <ChildTabContent child={child} />
                            </TabsContent>
                        ))}
                    </Tabs>
                )}
            </div>
        </div>
    );
}
