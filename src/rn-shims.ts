// See https://docs.ethers.io/v5/cookbook/react-native/#cookbook-reactnative

// Import the crypto getRandomValues shim (**BEFORE** the shims)
import 'react-native-get-random-values'

// Pull in the shims (BEFORE importing ethers)
import '@ethersproject/shims'
