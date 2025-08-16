import { Box, BoxProps } from '@pancakeswap/uikit'

const Container: React.FC<React.PropsWithChildren<BoxProps>> = ({ children, ...props }) => (
  <Box px={["16px", "16px", "20px", "20px", "24px"]} mx="auto" maxWidth={["1248px", "1248px", "1248px", "1248px", "1248px", "1248px", "1488px"]} {...props}>
    {children}
  </Box>
)

export default Container
