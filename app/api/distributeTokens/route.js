import { Connection, PublicKey, Transaction, Keypair, clusterApiUrl } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount, createTransferInstruction } from '@solana/spl-token';
import bs58 from 'bs58';
import { NextResponse } from 'next/server';

export async function POST(req) {
    const { mainWallet, mintAddress, friends, rpcUrl } = await req.json();

    try {
        const connection = new Connection(rpcUrl, 'confirmed');
        const walletKeypair = Keypair.fromSecretKey(bs58.decode(mainWallet));
        const mintPublicKey = new PublicKey(mintAddress);

        const mainTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            walletKeypair,
            mintPublicKey,
            walletKeypair.publicKey
        );

        const tokenAccountInfo = await connection.getParsedAccountInfo(mainTokenAccount.address);
        const decimals = tokenAccountInfo.value.data.parsed.info.tokenAmount.decimals;
        const amount = tokenAccountInfo.value.data.parsed.info.tokenAmount.amount;
        const totalTokens = Number(amount) / (10 ** decimals);

        const totalSolContributed = friends.reduce((sum, friend) => sum + Number(friend.solContributed), 0);
        const transaction = new Transaction();

        for (let friend of friends) {
            const amountToTransfer = (Number(friend.solContributed) / totalSolContributed) * totalTokens;
            const friendTokenAccount = await getOrCreateAssociatedTokenAccount(
                connection,
                walletKeypair,
                mintPublicKey,
                new PublicKey(friend.address)
            );

            const amountToTransferInt = Math.floor(amountToTransfer * (10 ** decimals));
            transaction.add(
                createTransferInstruction(
                    mainTokenAccount.address,
                    friendTokenAccount.address,
                    walletKeypair.publicKey,
                    amountToTransferInt
                )
            );
        }

        const signature = await connection.sendTransaction(transaction, [walletKeypair]);
        return NextResponse.json({ success: true, signature });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
