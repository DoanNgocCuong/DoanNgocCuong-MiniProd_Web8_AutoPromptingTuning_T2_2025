package main

import (
	"fmt"
	"log"
	"os"
	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
)

type PromptRequest struct {
	Format     string   `json:"format"`
	Samples    []Sample `json:"samples"`
	Conditions string   `json:"conditions"`
}

type Sample struct {
	Input  string `json:"input"`
	Output string `json:"output"`
}

type PromptResponse struct {
	GeneratedPrompt string    `json:"generated_prompt"`
	TestCases      []TestCase `json:"test_cases"`
	Accuracy       float64    `json:"accuracy"`
}

type TestCase struct {
	Input    string  `json:"input"`
	Output   string  `json:"output"`
	Accuracy float64 `json:"accuracy"`
}

func main() {
	r := gin.Default()

	// Configure CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://103.253.20.13:25043"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
	}))

	r.POST("/api/generate-prompt", generatePrompt)
	r.POST("/api/evaluate-prompt", evaluatePrompt)
	r.POST("/api/optimize-prompt", optimizePrompt)

	host := os.Getenv("HOST")
	if host == "" {
		host = "0.0.0.0"
	}
	
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	serverAddr := fmt.Sprintf("%s:%s", host, port)
	log.Printf("Server starting on %s", serverAddr)
	log.Fatal(r.Run(serverAddr))
}

func generatePrompt(c *gin.Context) {
	var req PromptRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// TODO: Implement prompt generation logic
	response := PromptResponse{
		GeneratedPrompt: "Generated prompt based on samples",
		TestCases:      []TestCase{},
		Accuracy:       0.0,
	}

	c.JSON(200, response)
}

func evaluatePrompt(c *gin.Context) {
	// TODO: Implement prompt evaluation logic
	c.JSON(200, gin.H{"message": "Evaluation endpoint"})
}

func optimizePrompt(c *gin.Context) {
	// TODO: Implement prompt optimization logic
	c.JSON(200, gin.H{"message": "Optimization endpoint"})
} 