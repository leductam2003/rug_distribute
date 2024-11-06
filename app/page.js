"use client"
import { useState, useEffect } from 'react';

export default function Home() {
    const [mainWallet, setMainWallet] = useState('');
    const [mintAddress, setMintAddress] = useState('');
    const [friends, setFriends] = useState([{ address: '', solContributed: '', note: '' }]);
    const [status, setStatus] = useState('');
    const [rpcUrl, setRpcUrl] = useState('https://mainnet.helius-rpc.com/?api-key=298da113-724f-45fa-a2c3-7616a2eaba88');

    // Load data from local storage on component mount
    useEffect(() => {
        const savedData = localStorage.getItem('tokenDistributionData');
        if (savedData) {
            const { mainWallet, mintAddress, friends } = JSON.parse(savedData);
            setMainWallet(mainWallet);
            setMintAddress(mintAddress);
            setFriends(friends);
        }
    }, []);

    // Save data to local storage whenever it changes
    useEffect(() => {
        localStorage.setItem('tokenDistributionData', JSON.stringify({ mainWallet, mintAddress, friends }));
    }, [mainWallet, mintAddress, friends]);

    // Add more friend inputs
    const addFriend = () => {
        setFriends([...friends, { address: '', solContributed: '', note: '' }]);
    };

    // Update friend input values
    const updateFriend = (index, field, value) => {
        const updatedFriends = [...friends];
        updatedFriends[index][field] = value;
        setFriends(updatedFriends);
    };

    // Remove a friend from the list
    const removeFriend = (index) => {
        const updatedFriends = friends.filter((_, i) => i !== index);
        setFriends(updatedFriends);
    };

    // Submit form to trigger transaction
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Set status to indicate process started
        setStatus('Processing transaction...');

        // Call the backend to perform the distribution (you would typically use an API here)
        try {
            const response = await fetch('/api/distributeTokens', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ mainWallet, mintAddress, friends, rpcUrl }),
            });

            const result = await response.json();
            if (result.success) {
                setStatus(`Transaction successful! Signature: ${result.signature}`);
            } else {
                setStatus(`Transaction failed: ${result.error}`);
            }
        } catch (error) {
            setStatus(`Error: ${error.message}`);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Token Distribution UI</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">RPC URL:</label>
                    <input
                        type="text"
                        value={rpcUrl}
                        onChange={(e) => setRpcUrl(e.target.value)}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Main Wallet:</label>
                    <input
                        type="password"
                        value={mainWallet}
                        onChange={(e) => setMainWallet(e.target.value)}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Mint Address:</label>
                    <input
                        type="text"
                        value={mintAddress}
                        onChange={(e) => setMintAddress(e.target.value)}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Friends</label>
                    {friends.map((friend, index) => (
                        <div key={index} className="flex space-x-2 mb-2">
                            <input
                                type="text"
                                placeholder="Friend's Address"
                                value={friend.address}
                                onChange={(e) => updateFriend(index, 'address', e.target.value)}
                                required
                                className="block w-full border border-gray-300 rounded-md p-2"
                            />
                            <input
                                type="number"
                                placeholder="SOL Contributed"
                                value={friend.solContributed}
                                onChange={(e) => updateFriend(index, 'solContributed', e.target.value)}
                                required
                                className="block w-24 border border-gray-300 rounded-md p-2"
                            />
                            <input
                                type="text"
                                placeholder="Note"
                                value={friend.note}
                                onChange={(e) => updateFriend(index, 'note', e.target.value)}
                                className="block w-24 border border-gray-300 rounded-md p-2"
                            />
                            <button
                                type="button"
                                onClick={() => removeFriend(index)}
                                className="mt-2 bg-red-500 text-white rounded-md p-2"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={addFriend} className="mt-2 bg-blue-500 text-white rounded-md p-2">
                        + Add Friend
                    </button>
                </div>
                <button type="submit" className="mt-4 bg-green-500 text-white rounded-md p-2">Distribute Tokens</button>
            </form>
            <div className="mt-4">
                <label className="block text-sm font-medium">Status: </label>
                <span>{status}</span>
            </div>
        </div>
    );
}
