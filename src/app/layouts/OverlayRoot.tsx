import { useEffect } from 'react'
import { RecoveryDialog, ShareDialog } from '@/features'
import { useOverlayStore } from '@/features/overlays'
import { CommandPalette, ExportDialog, NewDocumentDialog } from '@/overlay'

function OverlayRoot() {
	const openOverlay = useOverlayStore((state) => state.openOverlay)

	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			const isCommandPaletteShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k'

			if (!isCommandPaletteShortcut) {
				return
			}

			event.preventDefault()
			openOverlay('command-palette', {
				source: 'keyboard-shortcut',
			})
		}

		window.addEventListener('keydown', handleKeyDown)

		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [openOverlay])

	return (
		<>
			<CommandPalette />
			<NewDocumentDialog />
			<ExportDialog />
			<RecoveryDialog />
			<ShareDialog />
		</>
	)
}

export default OverlayRoot
