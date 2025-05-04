import React, { useState } from 'react';
import { Box, Flex, Icon, Text, useColorModeValue } from '@chakra-ui/react';
import { FaHome, FaComments, FaQuestion, FaNewspaper } from 'react-icons/fa';
import { useHistory, useLocation } from 'react-router-dom';

const Bottombar = () => {
  const history = useHistory();
  const location = useLocation();
  const currentPath = location.pathname;
  
  const bgColor = useColorModeValue('white', 'gray.900');
  const activeColor = useColorModeValue('blue.500', 'blue.300');
  const inactiveColor = useColorModeValue('gray.500', 'gray.400');
  const hoverBgColor = useColorModeValue('gray.100', 'gray.700');
  
  const navItems = [
    { name: 'Chats', icon: FaComments, path: '/chats' },
    { name: 'Query', icon: FaQuestion, path: '/query' },
    { name: 'News', icon: FaNewspaper, path: '/news' },
  ];

  const handleNavigation = (path) => {
    history.push(path);
  };

  return (
    <Box
      position="fixed"
      bottom="0"
      width="100%"
      bg={bgColor}
      boxShadow="0 -2px 10px rgba(0,0,0,0.05)"
      borderTopRadius="16px"
      zIndex="10"
    >
      <Flex 
        justify="space-around" 
        p={2} 
        maxWidth="400px" 
        mx="auto"
      >
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <Flex
              key={item.name}
              direction="column"
              align="center"
              justify="center"
              py={1}
              px={3}
              cursor="pointer"
              borderRadius="lg"
              transition="all 0.2s"
              onClick={() => handleNavigation(item.path)}
              _hover={{ 
                bg: hoverBgColor,
                transform: 'translateY(-2px)'
              }}
              role="group"
            >
              <Box
                p={1.5}
                borderRadius="full"
                bg={isActive ? `${activeColor}10` : 'transparent'}
                mb={1}
                transition="all 0.2s"
                _groupHover={{ transform: 'scale(1.1)' }}
              >
                <Icon 
                  as={item.icon} 
                  fontSize="lg"
                  color={isActive ? activeColor : inactiveColor}
                  transition="all 0.2s"
                />
              </Box>
              <Text
                fontSize="xs"
                fontWeight={isActive ? "medium" : "normal"}
                color={isActive ? activeColor : inactiveColor}
                transition="all 0.2s"
              >
                {item.name}
              </Text>
            </Flex>
          );
        })}
      </Flex>
    </Box>
  );
};

export default Bottombar;