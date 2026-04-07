import { ConfirmDialog, NewDocumentDialog } from '@/features/overlays'

function OverlayRoot() {
	return (
		<>
			<NewDocumentDialog />
			<ConfirmDialog />
		</>
	)
}

export default OverlayRoot
