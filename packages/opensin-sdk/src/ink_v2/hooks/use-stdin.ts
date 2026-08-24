import { useContext } from 'react'
<<<<<<< HEAD
import StdinContext from '../components/StdinContext'
=======
import StdinContext from '../../components_v2/StdinContext.js'
>>>>>>> 14499e481 (feat: Complete sin-claude migration to OpenSIN-Code (1,565+ files))

/**
 * `useStdin` is a React hook, which exposes stdin stream.
 */
const useStdin = () => useContext(StdinContext)
export default useStdin
