import { Stack, useLocalSearchParams, router } from "expo-router";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  ScrollView 
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { supabase, addVote } from "../../lib/supabase";
import { Protected, useAuth } from "../../components/AuthContext";

type Poll = {
  id: number;
  question: string;
  options: string[];
  createdAt: string | null;
};

type VoteCount = {
  option_value: string;
  count: number | string;
};

function PollDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});
  const [totalVotes, setTotalVotes] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!id) return;

    const fetchPoll = async () => {
      try {
        setLoading(true);
        
        // Fetch the poll
        const { data: pollData, error: pollError } = await supabase
          .from('polls')
          .select('*')
          .eq('id', id)
          .single();

        if (pollError) {
          console.error("Error fetching poll:", pollError.message);
          throw pollError;
        }

        if (!pollData) {
          console.error("No poll found with id:", id);
          throw new Error("Poll not found");
        }

        setPoll(pollData);
        
        // Fetch vote counts
        await fetchVoteCounts();
        
        // Check if user has already voted
        if (user) {
          const { data: userVoteData, error: userVoteError } = await supabase
            .from('votes')
            .select('option_value')
            .eq('poll_id', id)
            .eq('voter_id', user.id)
            .single();
          
          if (!userVoteError && userVoteData) {
            setHasVoted(true);
            setSelected(userVoteData.option_value);
          }
        }
      } catch (error) {
        console.error("Error loading poll data:", error);
        Alert.alert("Error", "Failed to load the poll");
      } finally {
        setLoading(false);
      }
    };

    fetchPoll();
  }, [id, user]);

  const fetchVoteCounts = async () => {
    if (!id) return;
    
    try {
      // Fetch vote counts for this poll
      const { data: votesData, error: votesError } = await supabase
        .from('votes')
        .select('option_value, count(*)')
        .eq('poll_id', id)
        .group('option_value');
        
      if (votesError) {
        console.error("Error fetching vote counts:", votesError.message);
        return;
      }
      
      if (votesData && votesData.length > 0) {
        const counts: Record<string, number> = {};
        let total = 0;
        
        votesData.forEach((vote: VoteCount) => {
          // Convert count to number (it could be returned as string)
          const voteCount = typeof vote.count === 'string' 
            ? parseInt(vote.count, 10) 
            : vote.count;
            
          counts[vote.option_value] = voteCount;
          total += voteCount;
        });
        
        setVoteCounts(counts);
        setTotalVotes(total);
      }
    } catch (error) {
      console.error("Error processing vote counts:", error);
    }
  };

  const vote = async () => {
    if (!selected) {
      Alert.alert("Error", "Please select an option");
      return;
    }

    if (hasVoted) {
      Alert.alert("Already Voted", "You have already voted in this poll");
      return;
    }

    try {
      setSubmitting(true);
      
      // Record the vote using the helper function
      const { error } = await addVote(
        parseInt(id as string, 10),
        selected,
        user?.id
      );

      if (error) {
        // Check for unique constraint violation (user already voted)
        if (error.code === '23505') {
          setHasVoted(true);
          Alert.alert("Already Voted", "You have already voted in this poll");
          return;
        }
        
        throw error;
      }

      // Update the local vote count
      setVoteCounts(prev => ({
        ...prev,
        [selected]: (prev[selected] || 0) + 1
      }));
      
      setTotalVotes(prev => prev + 1);
      setHasVoted(true);

      Alert.alert(
        "Success", 
        "Your vote has been recorded!", 
        [{ text: "OK" }]
      );
      
    } catch (error: any) {
      console.error("Error submitting vote:", error);
      Alert.alert("Error", `Failed to submit your vote: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getPercentage = (option: string): number => {
    if (!totalVotes) return 0;
    return Math.round(((voteCounts[option] || 0) / totalVotes) * 100);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading poll...</Text>
      </View>
    );
  }

  if (!poll) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Poll not found</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: "Poll" }} />

      <Text style={styles.question}>{poll.question}</Text>

      {hasVoted && (
        <View style={styles.votedBadge}>
          <Feather name="check-circle" size={16} color="#fff" />
          <Text style={styles.votedText}>You voted</Text>
        </View>
      )}

      <View style={styles.optionsContainer}>
        {poll.options?.map((option, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => !hasVoted && setSelected(option)}
            disabled={hasVoted}
            style={[
              styles.optionCard,
              selected === option && styles.selectedOption
            ]}
          >
            <View style={styles.optionHeader}>
              <Feather
                name={selected === option ? "check-circle" : "circle"}
                size={20}
                color={selected === option ? "#2ecc71" : "#bdc3c7"}
              />
              <Text style={styles.optionText}>{option}</Text>
            </View>
            
            {/* Always show results if user has voted */}
            {(totalVotes > 0 || hasVoted) && (
              <View style={styles.resultContainer}>
                <View 
                  style={[
                    styles.progressBar,
                    { width: `${getPercentage(option)}%` }
                  ]} 
                />
                <Text style={styles.voteCount}>
                  {voteCounts[option] || 0} votes ({getPercentage(option)}%)
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
      
      {!hasVoted && (
        <TouchableOpacity 
          onPress={vote} 
          style={[
            styles.voteButton,
            (!selected || submitting) && styles.disabledButton
          ]}
          disabled={!selected || submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.voteButtonText}>Submit Vote</Text>
          )}
        </TouchableOpacity>
      )}
      
      {(totalVotes > 0 || hasVoted) && (
        <Text style={styles.totalVotes}>
          Total votes: {totalVotes}
        </Text>
      )}
      
      <TouchableOpacity 
        style={styles.homeButton}
        onPress={() => router.replace("/")}
      >
        <Feather name="home" size={16} color="#3498db" />
        <Text style={styles.homeButtonText}>Back to Polls</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Protected wrapper component
export default function ProtectedPollDetails() {
  return (
    <Protected>
      <PollDetails />
    </Protected>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 16,
  },
  question: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 24,
    color: '#2c3e50',
  },
  votedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2ecc71',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  votedText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  selectedOption: {
    borderColor: '#2ecc71',
    borderWidth: 2,
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  resultContainer: {
    marginTop: 8,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: '#3498db',
    opacity: 0.6,
  },
  voteCount: {
    position: 'absolute',
    right: 8,
    top: 3,
    fontSize: 12,
    fontWeight: '600',
  },
  voteButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
  },
  voteButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  totalVotes: {
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 14,
    color: '#7f8c8d',
  },
  backButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  homeButtonText: {
    color: '#3498db',
    marginLeft: 8,
    fontSize: 16,
  },
});