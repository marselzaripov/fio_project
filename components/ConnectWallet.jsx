import { NetworkErrorMessage } from "./NetworkErrorMessage"
import Button from "react-bootstrap/Button";

export function ConnectWallet({ connectWallet, networkError, dismiss }) {
  return (
    <>
      <div>
        {networkError && (
          <NetworkErrorMessage 
            message={networkError} 
            dismiss={dismiss} 
          />
        )}
      </div>

      {/* <p>Please connect your account...</p> */}
      <Button type="button" variant="outline-success" onClick={connectWallet}>Connect Wallet</Button>

    </>
  )
}