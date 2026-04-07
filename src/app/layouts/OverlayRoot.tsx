import { useEffect } from 'react'
import { RecoveryDialog, ShareDialog } from '@/features'
import { CommandPalette, ExportDialog, NewDocumentDialog } from '@/overlay'
import { useOverlayStore } from '@/stores/overlay.store'

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
