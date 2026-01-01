import { MouseEvent } from "react";
import {
  Heading,
  Link,
  Card,
  CardHeader,
  Flex,
  Spacer,
} from "@chakra-ui/react";
import { useFriggState } from '../hooks/useFriggState';
import { colors } from '../config/theme';
import { content } from '../config/content';

export function EmptyState(props: { onChoice: (question: string) => any }) {
  const { isDarkMode } = useFriggState();
  const themeColors = isDarkMode ? colors.dark : colors.light;
  
  const handleClick = (e: MouseEvent) => {
    const text = (e.target as HTMLDivElement).innerText;
    console.log('Button clicked, sending:', text);
    props.onChoice(text);
  };
  return (
    <div className="rounded flex flex-col items-center max-w-full md:p-8">
      <Flex marginTop={"25px"} grow={1} maxWidth={"800px"} width={"100%"}>
        <Card
          onMouseUp={handleClick}
          width={"48%"}
          height={"80px"}
          backgroundColor={isDarkMode ? themeColors.chakra.gray[800] : themeColors.chakra.white}
          border={"1px solid"}
          borderColor={isDarkMode ? themeColors.chakra.gray[600] : themeColors.chakra.gray[300]}
          _hover={{ backgroundColor: isDarkMode ? themeColors.chakra.gray[700] : themeColors.chakra.gray[50] }}
          cursor={"pointer"}
          justifyContent={"center"}
          rounded={"lg"}
        >
          <CardHeader justifyContent={"center"}>
            <Heading
              fontSize="lg"
              fontWeight={"medium"}
              mb={1}
              color={isDarkMode ? themeColors.chakra.gray[200] : themeColors.chakra.gray[700]}
              textAlign={"center"}
            >
              {content.buttons.promptButtons[0]}
            </Heading>
          </CardHeader>
        </Card>
        <Spacer />
        <Card
          onMouseUp={handleClick}
          width={"48%"}
          height={"80px"}
          backgroundColor={isDarkMode ? themeColors.chakra.gray[800] : themeColors.chakra.white}
          border={"1px solid"}
          borderColor={isDarkMode ? themeColors.chakra.gray[600] : themeColors.chakra.gray[300]}
          _hover={{ backgroundColor: isDarkMode ? themeColors.chakra.gray[700] : themeColors.chakra.gray[50] }}
          cursor={"pointer"}
          justifyContent={"center"}
          rounded={"lg"}
        >
          <CardHeader justifyContent={"center"}>
            <Heading
              fontSize="lg"
              fontWeight={"medium"}
              mb={1}
              color={isDarkMode ? themeColors.chakra.gray[200] : themeColors.chakra.gray[700]}
              textAlign={"center"}
            >
              {content.buttons.promptButtons[1]}
            </Heading>
          </CardHeader>
        </Card>
      </Flex>
      <Flex marginTop={"25px"} grow={1} maxWidth={"800px"} width={"100%"}>
        <Card
          onMouseUp={handleClick}
          width={"48%"}
          height={"80px"}
          backgroundColor={isDarkMode ? themeColors.chakra.gray[800] : themeColors.chakra.white}
          border={"1px solid"}
          borderColor={isDarkMode ? themeColors.chakra.gray[600] : themeColors.chakra.gray[300]}
          _hover={{ backgroundColor: isDarkMode ? themeColors.chakra.gray[700] : themeColors.chakra.gray[50] }}
          cursor={"pointer"}
          justifyContent={"center"}
          rounded={"lg"}
        >
          <CardHeader justifyContent={"center"}>
            <Heading
              fontSize="lg"
              fontWeight={"medium"}
              mb={1}
              color={isDarkMode ? themeColors.chakra.gray[200] : themeColors.chakra.gray[700]}
              textAlign={"center"}
            >
              {content.buttons.promptButtons[2]}
            </Heading>
          </CardHeader>
        </Card>
        <Spacer />
        <Card
          onMouseUp={handleClick}
          width={"48%"}
          height={"80px"}
          backgroundColor={isDarkMode ? themeColors.chakra.gray[800] : themeColors.chakra.white}
          border={"1px solid"}
          borderColor={isDarkMode ? themeColors.chakra.gray[600] : themeColors.chakra.gray[300]}
          _hover={{ backgroundColor: isDarkMode ? themeColors.chakra.gray[700] : themeColors.chakra.gray[50] }}
          cursor={"pointer"}
          justifyContent={"center"}
          rounded={"lg"}
        >
          <CardHeader justifyContent={"center"}>
            <Heading
              fontSize="lg"
              fontWeight={"medium"}
              mb={1}
              color={isDarkMode ? themeColors.chakra.gray[200] : themeColors.chakra.gray[700]}
              textAlign={"center"}
            >
              {content.buttons.promptButtons[3]}
            </Heading>
          </CardHeader>
        </Card>
      </Flex>
    </div>
  );
}
