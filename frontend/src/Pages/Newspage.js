import React, { useEffect, useState, useRef } from 'react';
import { 
  Box, 
  Container,
  Grid,
  GridItem,
  Heading, 
  Text, 
  Stack, 
  Spinner,
  Alert,
  AlertIcon,
  Divider,
  Link,
  Badge,
  Button,
  useColorModeValue,
  Flex,
  Image,
  HStack,
  VStack,
  Tooltip,
  Tag,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tab,
  IconButton,
  useBreakpointValue,
  keyframes,
  chakra,
  Skeleton
} from '@chakra-ui/react';
import { 
  RefreshCw, 
  ExternalLink, 
  Clock, 
  Bookmark, 
  Star, 
  TrendingUp, 
  ArrowRight, 
  ArrowLeft, 
  ChevronRight,
  BarChart2,
  Gavel,
  Scale,
  BookOpen,
  FileText,
  Users
} from 'lucide-react';

// Base API URL for newsdata.io
const NEWS_API_BASE = 'https://newsdata.io/api/1/latest?apikey=pub_84689f00e53291fe5150c4d48e16ef6fda62a';

// Various legal search terms to get comprehensive coverage
const SEARCH_TERMS = [
  { term: 'law', icon: <Scale size={16} />, label: 'Law' },
  { term: 'legal', icon: <Gavel size={16} />, label: 'Legal' },
  { term: 'justice', icon: <Scale size={16} />, label: 'Justice' },
  { term: 'court', icon: <BookOpen size={16} />, label: 'Courts' },
  { term: 'legislation', icon: <FileText size={16} />, label: 'Legislation' },
  { term: 'rights', icon: <Users size={16} />, label: 'Rights' }
];

// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const pulse = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
`;

const slideIn = keyframes`
  from { transform: translateX(30px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const FadeInBox = chakra(Box, {
  baseStyle: {
    animation: `${fadeIn} 0.4s ease-in-out forwards`,
  },
});

const deduplicateNews = (newsArray) => {
  const uniqueTitles = new Set();
  return newsArray.filter(item => {
    if (!item.title || uniqueTitles.has(item.title)) return false;
    uniqueTitles.add(item.title);
    return true;
  });
};

function Newspage() {
  const [allNews, setAllNews] = useState([]);
  const [categoryNews, setCategoryNews] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [trendingNews, setTrendingNews] = useState([]);
  const [recentNews, setRecentNews] = useState([]);
  
  const carouselRef = useRef(null);
  const trendingRef = useRef(null);
  
  // Responsive settings
  const isMobile = useBreakpointValue({ base: true, md: false });
  const featuredCount = useBreakpointValue({ base: 1, sm: 2, md: 3, lg: 4 });
  const gridColumns = useBreakpointValue({ base: 1, md: 2, lg: 3 });
  
  // Fetch news for a specific search term
  const fetchNewsByTerm = async (term) => {
    try {
      const response = await fetch(`${NEWS_API_BASE}&q=${term}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch news for term: ${term}`);
      }
      const data = await response.json();
      
      if (!data.results || !Array.isArray(data.results)) {
        return [];
      }
      
      // Process and enhance results
      return data.results.map(item => ({
        ...item,
        searchTerm: term,
        image_url: item.image_url || `/api/placeholder/800/500?text=${encodeURIComponent((item.title || 'Legal News').substring(0, 20))}`,
        category: item.category || ['Legal'],
        importance: Math.random(), // Random importance for sorting
        pubDate: item.pubDate || new Date().toISOString()
      }));
    } 
    catch (err) {
      console.error(`Error fetching ${term} news:`, err);
      return [];
    }
  };

  const fetchAllNews = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch news for all search terms in parallel
      const promises = SEARCH_TERMS.map(({ term }) => fetchNewsByTerm(term));
      const results = await Promise.all(promises);
      
      // Organize results by search term
      const newsCategorized = {};
      SEARCH_TERMS.forEach(({ term }, index) => {
        newsCategorized[term] = results[index];
      });
      
      // Combine and deduplicate all news
      const allNewsItems = deduplicateNews(results.flat());
      
      // Sort by publication date (newest first)
      const sortedByDate = [...allNewsItems].sort((a, b) => 
        new Date(b.pubDate) - new Date(a.pubDate)
      );
      
      // Sort by importance for featured articles
      const sortedByImportance = [...allNewsItems].sort((a, b) => 
        b.importance - a.importance
      );
      
      setAllNews(allNewsItems);
      setCategoryNews(newsCategorized);
      setFeaturedArticles(sortedByImportance.slice(0, 6));
      setTrendingNews(sortedByImportance.slice(6, 12));
      setRecentNews(sortedByDate.slice(0, 10));
    } 
    catch (err) {
      setError("Failed to fetch news. Please try again later.");
      console.error("Error fetching news:", err);
    } 
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAllNews();
  };

  useEffect(() => {
    fetchAllNews();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Date unavailable';
    }
  };
  
  const scrollCarousel = (ref, direction) => {
    if (!ref.current) return;
    
    const scrollAmount = direction === 'right' ? 
      ref.current.offsetWidth * 0.8 : 
      -ref.current.offsetWidth * 0.8;
      
    ref.current.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  };
  
  const getTruncatedText = (text, length = 120) => {
    if (!text) return '';
    return text.length > length ? `${text.substring(0, length)}...` : text;
  };

  return (
    <Box 
      w="full" 
      bg="black" 
      minH="100vh" 
      py={6} 
      fontFamily="'Work Sans', sans-serif"
    >
      <Container maxW="container.xl" px={{ base: 4, md: 6 }}>
        {/* Header with animated accent border */}
        <Box
          position="relative"
          pb={3}
          mb={8}
          _after={{
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100px',
            height: '3px',
            backgroundImage: 'linear-gradient(90deg, #3182CE, rgba(49, 130, 206, 0.3))',
          }}
        >
          <Flex justifyContent="space-between" alignItems="center">
            <Flex alignItems="center">
              <Heading 
                color="white" 
                fontSize={{ base: '2xl', md: '3xl' }} 
                letterSpacing="tight"
                fontWeight="bold"
              >
                LEGAL
                <Text as="span" color="blue.400" ml={1}>PULSE</Text>
              </Heading>
              <Badge 
                ml={3} 
                colorScheme="blue" 
                variant="solid" 
                borderRadius="full" 
                px={2}
                animation={`${pulse} 2s infinite ease-in-out`}
              >
                LIVE
              </Badge>
            </Flex>
            
            <HStack spacing={3}>
              <Tooltip label="Refresh all news" placement="top">
                <Button
                  leftIcon={<RefreshCw size={16} />}
                  isLoading={refreshing}
                  onClick={handleRefresh}
                  variant="outline"
                  colorScheme="whiteAlpha"
                  size="sm"
                  fontWeight="normal"
                >
                  Refresh
                </Button>
              </Tooltip>
            </HStack>
          </Flex>
        </Box>

        {loading && !refreshing && (
          <Flex direction="column" justify="center" align="center" my={16}>
            <Spinner color="white" size="xl" thickness="4px" mb={4} />
            <Text color="gray.400">Loading comprehensive legal news...</Text>
          </Flex>
        )}

        {error && (
          <Alert status="error" borderRadius="md" mb={6}>
            <AlertIcon />
            {error}
          </Alert>
        )}
        
        {!loading && allNews.length === 0 && (
          <Box 
            p={10} 
            textAlign="center" 
            borderRadius="lg" 
            borderWidth="1px" 
            borderColor="gray.700"
          >
            <Text color="gray.400" fontSize="lg">No legal news found. Please try again later.</Text>
            <Button 
              mt={4} 
              colorScheme="blue" 
              onClick={handleRefresh}
              size="sm"
            >
              Try Again
            </Button>
          </Box>
        )}

        {!loading && allNews.length > 0 && (
          <FadeInBox>
            {/* Featured Article Showcase */}
            {featuredArticles.length > 0 && (
              <Box mb={10}>
                <Flex justifyContent="space-between" alignItems="center" mb={4}>
                  <Heading size="md" color="white" fontWeight="semibold">
                    <Flex align="center">
                      <TrendingUp size={20} style={{ marginRight: '8px' }} /> 
                      Featured Stories
                    </Flex>
                  </Heading>
                </Flex>
                
                <Box 
                  position="relative" 
                  mb={4}
                >
                  <Box
                    ref={carouselRef}
                    display="flex"
                    overflowX="auto"
                    scrollBehavior="smooth"
                    py={4}
                    css={{
                      '&::-webkit-scrollbar': {
                        display: 'none',
                      },
                      'scrollbarWidth': 'none',
                      'msOverflowStyle': 'none',
                    }}
                  >
                    {featuredArticles.map((article, idx) => (
                      <Box 
                        key={idx}
                        minW={{ base: '280px', md: '350px', lg: '400px' }}
                        h={{ base: '220px', md: '250px' }}
                        mr={4}
                        position="relative"
                        borderRadius="lg"
                        overflow="hidden"
                        boxShadow="lg"
                        transition="transform 0.3s"
                        _hover={{
                          transform: 'scale(1.02)',
                        }}
                      >
                        <Image
                          src={article.image_url}
                          alt={article.title}
                          w="full"
                          h="full"
                          objectFit="cover"
                        />
                        <Box
                          position="absolute"
                          top={0}
                          left={0}
                          right={0}
                          bottom={0}
                          bgGradient="linear(to-t, black, rgba(0,0,0,0.7), rgba(0,0,0,0.2))"
                          p={4}
                          display="flex"
                          flexDirection="column"
                          justifyContent="flex-end"
                        >
                          <Tag size="sm" colorScheme="blue" alignSelf="flex-start" mb={2}>
                            {article.searchTerm}
                          </Tag>
                          <Heading
                            size="sm"
                            color="white"
                            fontWeight="semibold"
                            noOfLines={2}
                            mb={2}
                          >
                            {article.title}
                          </Heading>
                          <Flex 
                            justify="space-between" 
                            align="center"
                            fontSize="xs"
                            color="gray.300"
                          >
                            <Text>{article.source_id || 'Legal Source'}</Text>
                            <Flex align="center">
                              <Clock size={12} style={{ marginRight: '4px' }} />
                              <Text>{formatDate(article.pubDate).split(',')[0]}</Text>
                            </Flex>
                          </Flex>
                          <Link 
                            href={article.link} 
                            isExternal 
                            mt={2}
                            color="blue.300"
                            fontSize="xs"
                            fontWeight="bold"
                            display="flex"
                            alignItems="center"
                          >
                            READ FULL STORY <ChevronRight size={14} />
                          </Link>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                  
                  {/* Carousel Navigation */}
                  <Flex justify="center" mt={4}>
                    <IconButton
                      icon={<ArrowLeft size={16} />}
                      onClick={() => scrollCarousel(carouselRef, 'left')}
                      variant="outline"
                      colorScheme="whiteAlpha"
                      size="sm"
                      mr={2}
                      isRound
                      aria-label="Previous"
                    />
                    <IconButton
                      icon={<ArrowRight size={16} />}
                      onClick={() => scrollCarousel(carouselRef, 'right')}
                      variant="outline"
                      colorScheme="whiteAlpha"
                      size="sm"
                      isRound
                      aria-label="Next"
                    />
                  </Flex>
                </Box>
              </Box>
            )}
            
            {/* Tabs for Different News Categories */}
            <Box mb={10}>
              <Tabs 
                variant="line" 
                colorScheme="blue" 
                onChange={setActiveTab}
                isLazy
              >
                <TabList 
                  overflowX="auto" 
                  overflowY="hidden" 
                  whiteSpace="nowrap"
                  css={{
                    '&::-webkit-scrollbar': {
                      height: '2px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: 'rgba(255,255,255,0.2)',
                    }
                  }}
                >
                  <Tab 
                    color="gray.400" 
                    _selected={{ color: 'blue.400', borderColor: 'blue.400' }}
                  >
                    <Flex align="center">
                      <BarChart2 size={16} style={{ marginRight: '6px' }} />
                      All News
                    </Flex>
                  </Tab>
                  {SEARCH_TERMS.map((term, idx) => (
                    <Tab 
                      key={idx} 
                      color="gray.400" 
                      _selected={{ color: 'blue.400', borderColor: 'blue.400' }}
                    >
                      <Flex align="center">
                        {term.icon}
                        <Text ml={2}>{term.label}</Text>
                      </Flex>
                    </Tab>
                  ))}
                </TabList>

                <TabPanels>
                  {/* All News Tab */}
                  <TabPanel p={0} pt={6}>
                    <Grid 
                      templateColumns={{ 
                        base: '1fr', 
                        md: 'repeat(2, 1fr)', 
                        lg: 'repeat(3, 1fr)' 
                      }}
                      gap={6}
                    >
                      {recentNews.map((article, idx) => (
                        <GridItem 
                          key={idx} 
                          bg="gray.900" 
                          borderRadius="lg" 
                          overflow="hidden"
                          transition="all 0.3s"
                          _hover={{ 
                            transform: 'translateY(-5px)',
                            boxShadow: 'xl'
                          }}
                        >
                          <Box position="relative" h={{ base: '160px', md: '180px' }}>
                            <Image
                              src={article.image_url}
                              alt={article.title}
                              w="full"
                              h="full"
                              objectFit="cover"
                            />
                            <Tag 
                              position="absolute" 
                              top={2} 
                              right={2}
                              size="sm"
                              colorScheme="blue"
                              borderRadius="full"
                            >
                              {article.searchTerm}
                            </Tag>
                          </Box>
                          <Box p={4}>
                            <Heading
                              as="h3"
                              size="sm"
                              mb={3}
                              color="white"
                              noOfLines={2}
                              lineHeight="tall"
                            >
                              {article.title}
                            </Heading>
                            <Text 
                              color="gray.300" 
                              fontSize="sm" 
                              noOfLines={3}
                              mb={3}
                            >
                              {article.description}
                            </Text>
                            <Divider mb={3} borderColor="gray.700" />
                            <Flex 
                              justify="space-between" 
                              align="center"
                              color="gray.400"
                              fontSize="xs"
                            >
                              <Text fontWeight="medium">{article.source_id || 'Legal Source'}</Text>
                              <Flex align="center">
                                <Clock size={12} style={{ marginRight: '4px' }} />
                                <Text>{formatDate(article.pubDate).split(',')[0]}</Text>
                              </Flex>
                            </Flex>
                            {article.link && (
                              <Link
                                href={article.link}
                                isExternal
                                display="inline-flex"
                                alignItems="center"
                                mt={3}
                                color="blue.400"
                                fontSize="sm"
                                fontWeight="medium"
                              >
                                Read full article <ExternalLink size={14} style={{ marginLeft: '4px' }} />
                              </Link>
                            )}
                          </Box>
                        </GridItem>
                      ))}
                    </Grid>
                  </TabPanel>
                  
                  {/* Category Tabs */}
                  {SEARCH_TERMS.map((term, idx) => (
                    <TabPanel key={idx} p={0} pt={6}>
                      <Grid 
                        templateColumns={{ 
                          base: '1fr', 
                          md: 'repeat(2, 1fr)', 
                          lg: 'repeat(3, 1fr)' 
                        }}
                        gap={6}
                      >
                        {categoryNews[term.term] && categoryNews[term.term].length > 0 ? (
                          categoryNews[term.term].map((article, articleIdx) => (
                            <GridItem 
                              key={articleIdx} 
                              bg="gray.900" 
                              borderRadius="lg" 
                              overflow="hidden"
                              transition="all 0.3s"
                              _hover={{ 
                                transform: 'translateY(-5px)',
                                boxShadow: 'xl'
                              }}
                            >
                              <Box position="relative" h={{ base: '160px', md: '180px' }}>
                                <Image
                                  src={article.image_url}
                                  alt={article.title}
                                  w="full"
                                  h="full"
                                  objectFit="cover"
                                />
                              </Box>
                              <Box p={4}>
                                <Heading
                                  as="h3"
                                  size="sm"
                                  mb={3}
                                  color="white"
                                  noOfLines={2}
                                  lineHeight="tall"
                                >
                                  {article.title}
                                </Heading>
                                <Text 
                                  color="gray.300" 
                                  fontSize="sm" 
                                  noOfLines={3}
                                  mb={3}
                                >
                                  {article.description}
                                </Text>
                                <Divider mb={3} borderColor="gray.700" />
                                <Flex 
                                  justify="space-between" 
                                  align="center"
                                  color="gray.400"
                                  fontSize="xs"
                                >
                                  <Text fontWeight="medium">{article.source_id || 'Legal Source'}</Text>
                                  <Flex align="center">
                                    <Clock size={12} style={{ marginRight: '4px' }} />
                                    <Text>{formatDate(article.pubDate).split(',')[0]}</Text>
                                  </Flex>
                                </Flex>
                                {article.link && (
                                  <Link
                                    href={article.link}
                                    isExternal
                                    display="inline-flex"
                                    alignItems="center"
                                    mt={3}
                                    color="blue.400"
                                    fontSize="sm"
                                    fontWeight="medium"
                                  >
                                    Read full article <ExternalLink size={14} style={{ marginLeft: '4px' }} />
                                  </Link>
                                )}
                              </Box>
                            </GridItem>
                          ))
                        ) : (
                          <GridItem colSpan={{ base: 1, md: 2, lg: 3 }}>
                            <Box 
                              p={10} 
                              textAlign="center" 
                              borderRadius="lg" 
                              borderWidth="1px" 
                              borderColor="gray.700"
                            >
                              <Text color="gray.400">No news found for {term.label}.</Text>
                            </Box>
                          </GridItem>
                        )}
                      </Grid>
                    </TabPanel>
                  ))}
                </TabPanels>
              </Tabs>
            </Box>
            
            {/* Trending Section */}
            {trendingNews.length > 0 && (
              <Box mb={10}>
                <Flex justifyContent="space-between" alignItems="center" mb={4}>
                  <Heading size="md" color="white" fontWeight="semibold">
                    <Flex align="center">
                      <Star size={20} style={{ marginRight: '8px' }} /> 
                      Trending Legal Topics
                    </Flex>
                  </Heading>
                </Flex>
                
                <Box position="relative">
                  <Box
                    ref={trendingRef}
                    display="flex"
                    overflowX="auto"
                    scrollBehavior="smooth"
                    py={2}
                    css={{
                      '&::-webkit-scrollbar': {
                        display: 'none',
                      },
                      'scrollbarWidth': 'none',
                      'msOverflowStyle': 'none',
                    }}
                  >
                    {trendingNews.map((article, idx) => (
                      <Box 
                        key={idx}
                        minW={{ base: '280px', md: '320px' }}
                        mr={4}
                        bg="gray.900"
                        p={4}
                        borderRadius="lg"
                        boxShadow="md"
                        transition="all 0.3s"
                        _hover={{
                          bg: 'gray.800',
                          transform: 'translateY(-3px)',
                        }}
                      >
                        <Flex mb={3}>
                          <Box 
                            w="70px" 
                            h="70px" 
                            borderRadius="md" 
                            overflow="hidden" 
                            mr={3} 
                            flexShrink={0}
                          >
                            <Image
                              src={article.image_url}
                              alt={article.title}
                              w="full"
                              h="full"
                              objectFit="cover"
                            />
                          </Box>
                          <Box>
                            <Heading
                              as="h3"
                              size="xs"
                              color="white"
                              noOfLines={2}
                              fontWeight="medium"
                            >
                              {article.title}
                            </Heading>
                            <Text
                              mt={1}
                              fontSize="xs"
                              color="gray.400"
                            >
                              {article.source_id || 'Legal Source'}
                            </Text>
                          </Box>
                        </Flex>
                        <Text
                          fontSize="sm"
                          color="gray.300"
                          noOfLines={2}
                        >
                          {getTruncatedText(article.description, 80)}
                        </Text>
                        {article.link && (
                          <Link
                            href={article.link}
                            isExternal
                            display="inline-flex"
                            alignItems="center"
                            mt={2}
                            color="blue.400"
                            fontSize="xs"
                            fontWeight="medium"
                          >
                            VIEW <ChevronRight size={14} />
                          </Link>
                        )}
                      </Box>
                    ))}
                  </Box>
                  
                  {/* Trending Navigation */}
                  <Flex justify="center" mt={4}>
                    <IconButton
                      icon={<ArrowLeft size={16} />}
                      onClick={() => scrollCarousel(trendingRef, 'left')}
                      variant="outline"
                      colorScheme="whiteAlpha"
                      size="sm"
                      mr={2}
                      isRound
                      aria-label="Previous"
                    />
                    <IconButton
                      icon={<ArrowRight size={16} />}
                      onClick={() => scrollCarousel(trendingRef, 'right')}
                      variant="outline"
                      colorScheme="whiteAlpha"
                      size="sm"
                      isRound
                      aria-label="Next"
                    />
                  </Flex>
                </Box>
              </Box>
            )}
          </FadeInBox>
        )}
        
        {/* Footer */}
        <Box 
          borderTop="1px solid" 
          borderColor="gray.800" 
          mt={10} 
          pt={6} 
          pb={8}
          textAlign="center"
        >
          <Text color="gray.500" fontSize="sm">
            LegalPulse News • Powered by Chakra UI • {new Date().getFullYear()}
          </Text>
        </Box>
      </Container>
    </Box>
  );
}

export default Newspage;