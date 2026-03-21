import type { ImageDto } from "@auction/shared-types";
import { Alert, Badge, Button, Card, ImageCarousel, ImageUploader, Input, Label } from "@auction/ui";
import type { SyntheticEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Countdown } from "@/features/auctions/components/Countdown";
import { useAuction } from "@/features/auctions/hooks/useAuction";
import { useCloseAuction } from "@/features/auctions/hooks/useCloseAuction";
import { useDeleteImage } from "@/features/auctions/hooks/useDeleteImage";
import { usePlaceBid } from "@/features/auctions/hooks/usePlaceBid";
import { useReorderImages } from "@/features/auctions/hooks/useReorderImages";
import { useUploadImages } from "@/features/auctions/hooks/useUploadImages";
import { getErrorMessage } from "@/shared/api/get-error-message";
import { useAuth } from "@/shared/auth/auth-context";
import { useAuctionRoom } from "@/shared/websocket/auction-events";

function formatCurrency(value: number) {
	return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function AuctionDetailPage() {
	const { auctionId = "" } = useParams();
	const { isAuthenticated, user } = useAuth();

	const auctionQuery = useAuction(auctionId);
	const placeBidMutation = usePlaceBid(auctionId);
	const closeAuctionMutation = useCloseAuction(auctionId);
	const uploadImagesMutation = useUploadImages(auctionId);
	const deleteImageMutation = useDeleteImage(auctionId);
	const reorderImagesMutation = useReorderImages(auctionId);

	const [bidAmount, setBidAmount] = useState("");
	const [isExpired, setIsExpired] = useState(false);
	const [currentEndsAt, setCurrentEndsAt] = useState<string | null>(null);
	const [showExtensionNotice, setShowExtensionNotice] = useState(false);

	// WebSocket integration
	const { extendedPayload, newBidPayload, clearExtension, clearNewBid } =
		useAuctionRoom(auctionId);

	// Handle auction extension from WebSocket
	useEffect(() => {
		if (extendedPayload) {
			setCurrentEndsAt(extendedPayload.newEndsAt);
			setShowExtensionNotice(true);

			// Auto-hide extension notice after 5 seconds
			const timeout = setTimeout(() => {
				setShowExtensionNotice(false);
			}, 5000);

			clearExtension();

			return () => clearTimeout(timeout);
		}
	}, [extendedPayload, clearExtension]);

	// Handle new bid from WebSocket (refresh auction data)
	useEffect(() => {
		if (newBidPayload) {
			// Refetch auction data to show new bid
			void auctionQuery.refetch();
			clearNewBid();
		}
	}, [newBidPayload, auctionQuery, clearNewBid]);

	// Sync currentEndsAt with auction data
	useEffect(() => {
		if (auctionQuery.data && !currentEndsAt) {
			setCurrentEndsAt(auctionQuery.data.endsAt);
		}
	}, [auctionQuery.data, currentEndsAt]);

	const minBid = useMemo(() => {
		if (!auctionQuery.data) {
			return 1;
		}

		return auctionQuery.data.highestBid + 1;
	}, [auctionQuery.data]);

	const isOwner = useMemo(() => {
		if (!auctionQuery.data || !user) return false;
		return auctionQuery.data.sellerId === user.id;
	}, [auctionQuery.data, user]);

	async function handlePlaceBid(event: SyntheticEvent<HTMLFormElement, Event>) {
		event.preventDefault();

		await placeBidMutation.mutateAsync({ amount: Number(bidAmount) });
		setBidAmount("");
	}

	async function handleCloseAuction() {
		await closeAuctionMutation.mutateAsync();
	}

	async function handleUploadImages(files: File[]): Promise<ImageDto[]> {
		const result = await uploadImagesMutation.mutateAsync(files);
		void auctionQuery.refetch();
		return result;
	}

	async function handleDeleteImage(imageId: string): Promise<void> {
		await deleteImageMutation.mutateAsync(imageId);
		void auctionQuery.refetch();
	}

	function handleImagesChange(updatedImages: ImageDto[]): void {
		const positions = updatedImages.map((img, index) => ({
			id: img.id,
			position: index,
			isPrimary: img.isPrimary,
		}));
		void reorderImagesMutation.mutateAsync(positions);
	}

	if (auctionQuery.isLoading) {
		return <p className="text-sm text-slate-600">Carregando leilão...</p>;
	}

	if (auctionQuery.isError || !auctionQuery.data) {
		return (
			<Alert variant="error">
				{getErrorMessage(auctionQuery.error, "Não foi possível carregar o leilão")}{" "}
				<Link to="/auctions">Voltar</Link>
			</Alert>
		);
	}

	const auction = auctionQuery.data;
	const displayEndsAt = currentEndsAt || auction.endsAt;
	const images: ImageDto[] = auction.images ?? [];

	return (
		<div className="space-y-4">
			{/* Extension notice banner */}
			{showExtensionNotice && (
				<div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg flex items-center gap-2 animate-fade-in">
					<svg
						className="w-5 h-5 text-amber-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						/>
					</svg>
					<span className="font-medium">
						Leilão prorrogado! Novo tempo adicionado devido ao anti-sniping.
					</span>
				</div>
			)}

			{/* Two-column layout on desktop */}
			<div className="grid md:grid-cols-2 gap-6">
				{/* Left: Image carousel */}
				<div className="md:sticky md:top-4 md:self-start">
					<ImageCarousel images={images} className="w-full" />

					{/* Image uploader for owner */}
					{isOwner && (
						<Card className="mt-4">
							<h3 className="text-lg font-semibold text-slate-900 mb-3">Gerenciar imagens</h3>
							<ImageUploader
								images={images}
								onChange={handleImagesChange}
								onUpload={handleUploadImages}
								onDelete={handleDeleteImage}
								maxImages={10}
								maxSizeMB={10}
							/>
						</Card>
					)}
				</div>

				{/* Right: Auction details and bid form */}
				<div className="space-y-4">
					<Card className="space-y-3">
						<div className="flex items-start justify-between gap-3">
							<div className="space-y-2">
								<h2 className="text-2xl font-bold text-slate-900">{auction.title}</h2>
								<Countdown endsAt={displayEndsAt} onExpire={() => setIsExpired(true)} />
							</div>

							<Badge variant={auction.status === "OPEN" && !isExpired ? "success" : "danger"}>
								{auction.status}
							</Badge>
						</div>

						<p className="text-slate-700">{auction.description ?? "Sem descrição cadastrada."}</p>

						<div className="grid gap-2 text-sm text-slate-700">
							<p>
								<span className="font-semibold">Lance inicial:</span>{" "}
								{formatCurrency(auction.startingPrice)}
							</p>
							<p>
								<span className="font-semibold">Maior lance:</span>{" "}
								{formatCurrency(auction.highestBid)}
							</p>
						</div>
					</Card>

					{isAuthenticated ? (
						<Card className="space-y-3">
							<h3 className="text-lg font-semibold text-slate-900">Enviar lance</h3>

							{placeBidMutation.isError ? (
								<Alert variant="error">
									{getErrorMessage(placeBidMutation.error, "Falha ao enviar lance")}
								</Alert>
							) : null}

							{placeBidMutation.isSuccess ? (
								<Alert variant="success">Lance enviado com sucesso!</Alert>
							) : null}

							<form className="space-y-3" onSubmit={(e) => void handlePlaceBid(e)}>
								<div>
									<Label htmlFor="bid-amount">Valor do lance</Label>
									<Input
										id="bid-amount"
										min={minBid}
										onChange={(event) => setBidAmount(event.target.value)}
										required
										step={1}
										type="number"
										value={bidAmount}
									/>
									<p className="mt-1 text-xs text-slate-500">
										Mínimo permitido: {formatCurrency(minBid)}
									</p>
								</div>

								<Button
									className="w-full"
									disabled={placeBidMutation.isPending || auction.status !== "OPEN" || isExpired}
									type="submit"
								>
									{placeBidMutation.isPending ? "Enviando..." : "Dar lance"}
								</Button>
							</form>

							<Button
								className="w-full"
								disabled={closeAuctionMutation.isPending || auction.status !== "OPEN" || isExpired}
								onClick={() => void handleCloseAuction()}
								type="button"
								variant="secondary"
							>
								{closeAuctionMutation.isPending ? "Encerrando..." : "Encerrar leilão"}
							</Button>

							{closeAuctionMutation.isError ? (
								<Alert variant="error">
									{getErrorMessage(closeAuctionMutation.error, "Falha ao encerrar leilão")}
								</Alert>
							) : null}
						</Card>
					) : (
						<Alert variant="info">
							Faça{" "}
							<Link className="font-semibold underline" to="/login">
								login
							</Link>{" "}
							para enviar lances e gerenciar leilões.
						</Alert>
					)}
				</div>
			</div>
		</div>
	);
}
