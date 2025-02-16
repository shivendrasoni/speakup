import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NavHeader } from "@/components/NavHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  ThumbsUp,
  Trophy,
  BookOpen,
  Users,
  Video,
  Bot,
  Search,
  Calendar,
  ArrowUp,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { TRANSLATIONS } from "@/pages/NewComplaint";

type PostType = 'discussion' | 'success_story' | 'resource' | 'peer_support' | 'qa_session';

type Post = {
  id: string;
  title: string;
  content: string;
  post_type: PostType;
  user_id: string;
  sector_id: string;
  upvotes: number;
  views: number;
  created_at: string;
};

type WebinarSession = {
  id: string;
  title: string;
  description: string;
  speaker_name: string;
  scheduled_at: string;
  duration_minutes: number;
  max_participants: number;
};

const Community = () => {
  const [selectedTab, setSelectedTab] = useState<PostType | "chatbot">("discussion");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const { language } = useLanguage();

  const { data: posts } = useQuery({
    queryKey: ["community-posts", selectedTab, searchQuery, selectedSector],
    queryFn: async () => {
      let query = supabase
        .from("community_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (selectedTab && selectedTab !== "chatbot") {
        query = query.eq("post_type", selectedTab);
      }

      if (selectedSector && selectedSector !== "all") {
        query = query.eq("sector_id", selectedSector);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Post[];
    },
  });

  const { data: sectors } = useQuery({
    queryKey: ["sectors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sectors")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: upcomingWebinars } = useQuery({
    queryKey: ["upcoming-webinars"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("webinar_sessions")
        .select("*")
        .gte("scheduled_at", new Date().toISOString())
        .order("scheduled_at")
        .limit(5);
      if (error) throw error;
      return data as WebinarSession[];
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader />
      <main className="container mx-auto py-8 px-4">
        <div className="flex flex-col space-y-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={`${TRANSLATIONS[language].description}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedSector} onValueChange={setSelectedSector}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={TRANSLATIONS[language].sector} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{TRANSLATIONS[language].sector}</SelectItem>
                {sectors?.map((sector) => (
                  <SelectItem key={sector.id} value={sector.id}>
                    {sector.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as PostType | "chatbot")}>
            <TabsList className="grid grid-cols-2 md:grid-cols-6 lg:w-[600px]">
              <TabsTrigger value="discussion">
                <MessageSquare className="h-4 w-4 mr-2" />
                {TRANSLATIONS[language].title}
              </TabsTrigger>
              <TabsTrigger value="success_story">
                <Trophy className="h-4 w-4 mr-2" />
                {TRANSLATIONS[language].successStories}
              </TabsTrigger>
              <TabsTrigger value="resource">
                <BookOpen className="h-4 w-4 mr-2" />
                {TRANSLATIONS[language].resources}
              </TabsTrigger>
              <TabsTrigger value="peer_support">
                <Users className="h-4 w-4 mr-2" />
                {TRANSLATIONS[language].peerSupport}
              </TabsTrigger>
              <TabsTrigger value="qa_session">
                <Video className="h-4 w-4 mr-2" />
                {TRANSLATIONS[language].liveQA}
              </TabsTrigger>
              <TabsTrigger value="chatbot">
                <Bot className="h-4 w-4 mr-2" />
                {TRANSLATIONS[language].aiHelp}
              </TabsTrigger>
            </TabsList>

            <div className="grid md:grid-cols-3 gap-6 mt-6">
              <div className="md:col-span-2">
                <TabsContent value="discussion" className="m-0">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Discussions</h2>
                    <Button>Start Discussion</Button>
                  </div>
                  <div className="space-y-4">
                    {posts?.filter(post => post.post_type === "discussion").map((post) => (
                      <Card key={post.id}>
                        <CardHeader>
                          <CardTitle>{post.title}</CardTitle>
                          <CardDescription>
                            Posted {format(new Date(post.created_at), "PPp")}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600">{post.content}</p>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <div className="flex items-center space-x-4">
                            <Button variant="ghost" size="sm">
                              <ThumbsUp className="h-4 w-4 mr-2" />
                              {post.upvotes}
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Comment
                            </Button>
                          </div>
                          <span className="text-sm text-gray-500">{post.views} views</span>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="success_story" className="m-0">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Success Stories</h2>
                    <Button>Share Your Story</Button>
                  </div>
                  <div className="space-y-4">
                    {posts?.filter(post => post.post_type === "success_story").map((post) => (
                      <Card key={post.id}>
                        <CardHeader>
                          <CardTitle>{post.title}</CardTitle>
                          <CardDescription>
                            Posted {format(new Date(post.created_at), "PPp")}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600">{post.content}</p>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <div className="flex items-center space-x-4">
                            <Button variant="ghost" size="sm">
                              <ThumbsUp className="h-4 w-4 mr-2" />
                              {post.upvotes}
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Comment
                            </Button>
                          </div>
                          <span className="text-sm text-gray-500">{post.views} views</span>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="resource" className="m-0">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Resource Hub</h2>
                    <Button>Add Resource</Button>
                  </div>
                  <div className="space-y-4">
                    {posts?.filter(post => post.post_type === "resource").map((post) => (
                      <Card key={post.id}>
                        <CardHeader>
                          <CardTitle>{post.title}</CardTitle>
                          <CardDescription>
                            Posted {format(new Date(post.created_at), "PPp")}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600">{post.content}</p>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <div className="flex items-center space-x-4">
                            <Button variant="ghost" size="sm">
                              <ThumbsUp className="h-4 w-4 mr-2" />
                              {post.upvotes}
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Comment
                            </Button>
                          </div>
                          <span className="text-sm text-gray-500">{post.views} views</span>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="peer_support" className="m-0">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Peer Support</h2>
                    <Button>Ask for Help</Button>
                  </div>
                  <div className="space-y-4">
                    {posts?.filter(post => post.post_type === "peer_support").map((post) => (
                      <Card key={post.id}>
                        <CardHeader>
                          <CardTitle>{post.title}</CardTitle>
                          <CardDescription>
                            Posted {format(new Date(post.created_at), "PPp")}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600">{post.content}</p>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <div className="flex items-center space-x-4">
                            <Button variant="ghost" size="sm">
                              <ThumbsUp className="h-4 w-4 mr-2" />
                              {post.upvotes}
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Comment
                            </Button>
                          </div>
                          <span className="text-sm text-gray-500">{post.views} views</span>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="qa_session" className="m-0">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Live Q&A Sessions</h2>
                  </div>
                  <div className="space-y-4">
                    {posts?.filter(post => post.post_type === "qa_session").map((post) => (
                      <Card key={post.id}>
                        <CardHeader>
                          <CardTitle>{post.title}</CardTitle>
                          <CardDescription>
                            Posted {format(new Date(post.created_at), "PPp")}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600">{post.content}</p>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <div className="flex items-center space-x-4">
                            <Button variant="ghost" size="sm">
                              <ThumbsUp className="h-4 w-4 mr-2" />
                              {post.upvotes}
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Comment
                            </Button>
                          </div>
                          <span className="text-sm text-gray-500">{post.views} views</span>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="chatbot" className="m-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>AI Assistant</CardTitle>
                      <CardDescription>
                        Get instant help with your consumer rights questions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Bot className="h-16 w-16 mx-auto text-blue-500 mb-4" />
                        <p>Coming soon! Our AI assistant will help you find answers quickly.</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Upcoming Webinars
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      {upcomingWebinars?.map((webinar) => (
                        <div key={webinar.id} className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <h4 className="font-medium">{webinar.title}</h4>
                          <p className="text-sm text-gray-600">
                            <Clock className="h-4 w-4 inline mr-1" />
                            {format(new Date(webinar.scheduled_at), "PPp")}
                          </p>
                          <p className="text-sm text-gray-600">
                            Duration: {webinar.duration_minutes} minutes
                          </p>
                          <Button className="w-full mt-2" variant="outline" size="sm">
                            Register Now
                          </Button>
                        </div>
                      ))}
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Trophy className="h-5 w-5 mr-2" />
                      Top Contributors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full" />
                            <span>Contributor {i}</span>
                          </div>
                          <span className="text-sm text-gray-500">{100 - i * 20} points</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Community;
