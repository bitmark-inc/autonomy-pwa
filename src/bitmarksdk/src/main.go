package main

import (
	"encoding/hex"
	"fmt"
	"net/http"
	"strings"
	"syscall/js"

	"golang.org/x/text/language"

	sdk "github.com/bitmark-inc/bitmark-sdk-go"
	"github.com/bitmark-inc/bitmark-sdk-go/account"
)

var alive = make(chan struct{})

func main() {
	jsSdkLib := js.Global().Get("BitmarkSdk")
	jsSdkLib.Set("setup", js.FuncOf(setup))
	jsSdkLib.Set("createNewAccount", js.FuncOf(createNewAccount))
	jsSdkLib.Set("parseAccount", js.FuncOf(parseAccount))
	jsSdkLib.Set("signMessage", js.FuncOf(signMessage))
	jsSdkLib.Set("decryptText", js.FuncOf(decryptText))
	jsSdkLib.Set("terminate", js.FuncOf(terminate))
	<-alive
}

// args: (apiToken string, networkMode string)
func setup(this js.Value, args []js.Value) interface{} {
	if len(args) != 2 || !args[0].Truthy() || !args[1].Truthy() {
		return js.ValueOf(false)
	}
	apiToken := args[0].String()
	network := sdk.Testnet
	if args[1].String() == "livenet" {
		network = sdk.Livenet
	}

	sdk.Init(&sdk.Config{
		Network:    network,
		APIToken:   apiToken,
		HTTPClient: http.DefaultClient,
	})
	return js.ValueOf(true)
}

// args: ()
func createNewAccount(this js.Value, args []js.Value) interface{} {
	acc, err := account.New()
	if err != nil {
		return js.ValueOf(false)
	}
	accv2 := acc.(*account.AccountV2)

	accountNumber := accv2.AccountNumber()
	recoveryWords, err := accv2.RecoveryPhrase(language.AmericanEnglish)
	if err != nil {
		return js.ValueOf(false)
	}
	recoveryPhrase := strings.Join(recoveryWords, " ")

	encryptionKey := accv2.EncrKey.PublicKeyBytes()
	encryptionKeyHex := hex.EncodeToString(encryptionKey)

	return js.ValueOf(map[string]interface{}{
		"account_number":    accountNumber,
		"recovery_phrase":   recoveryPhrase,
		"encryption_pubkey": encryptionKeyHex,
	})
}

func parseAccount(this js.Value, args []js.Value) interface{} {
	if len(args) != 1 || !args[0].Truthy() {
		return js.ValueOf(false)
	}

	recoveryPhrase := args[0].String()
	acc, err := account.FromRecoveryPhrase(strings.Split(recoveryPhrase, " "), language.AmericanEnglish)
	if err != nil {
		return js.ValueOf(false)
	}
	accv2 := acc.(*account.AccountV2)

	accountNumber := accv2.AccountNumber()
	encryptionKey := accv2.EncrKey.PublicKeyBytes()
	encryptionKeyHex := hex.EncodeToString(encryptionKey)
	return js.ValueOf(map[string]interface{}{
		"account_number":    accountNumber,
		"recovery_phrase":   recoveryPhrase,
		"encryption_pubkey": encryptionKeyHex,
	})
}

// args: (recoveryPhrase string, message string)
func signMessage(this js.Value, args []js.Value) interface{} {
	if len(args) != 2 || !args[0].Truthy() || !args[1].Truthy() {
		return js.ValueOf(false)
	}

	recoveryPhrase := args[0].String()
	message := args[1].String()

	acc, err := account.FromRecoveryPhrase(strings.Split(recoveryPhrase, " "), language.AmericanEnglish)
	if err != nil {
		return js.ValueOf(false)
	}

	signature := acc.Sign([]byte(message))
	signatureHex := hex.EncodeToString(signature)
	return js.ValueOf(signatureHex)
}

// args: (recoveryPhrase string, cipherText string, peerPublicKey string)
func decryptText(this js.Value, args []js.Value) interface{} {
	if len(args) != 3 || !args[0].Truthy() || !args[1].Truthy() || !args[2].Truthy() {
		return js.ValueOf(false)
	}

	recoveryPhrase := args[0].String()
	message := args[1].String()
	peerPubKey := args[2].String()

	acc, err := account.FromRecoveryPhrase(strings.Split(recoveryPhrase, " "), language.AmericanEnglish)
	if err != nil {
		return js.ValueOf(false)
	}

	messageBytes, err := hex.DecodeString(message)
	if err != nil {
		return js.ValueOf(false)
	}

	peerPubKeyBytes, err := hex.DecodeString(peerPubKey)
	if err != nil {
		return js.ValueOf(false)
	}

	textByte, err := acc.(*account.AccountV2).EncrKey.Decrypt(messageBytes, peerPubKeyBytes)
	if err != nil {
		return js.ValueOf(false)
	}

	// textHex := hex.EncodeToString(textByte)
	// fmt.Println(textHex)
	// return js.ValueOf(textHex)

	plaintextUint8Array := js.Global().Get("Uint8Array").New(len(textByte))
	js.CopyBytesToJS(plaintextUint8Array, textByte)

	return plaintextUint8Array
}

// args: (reason string)
func terminate(this js.Value, args []js.Value) interface{} {
	fmt.Println("SDK stops because: ", args[0].String())
	close(alive)
	return js.Null()
}
