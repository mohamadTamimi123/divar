const { Client, ClientFile, Property, City, Neighborhood } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

class ClientFileService {
    /**
     * Automatically associate new files with matching clients
     * @param {string} filePath - Path to the new file
     * @param {string} filename - Name of the file
     * @param {string} fileType - Type of file (property, crawled, generated)
     * @param {Object} metadata - Additional metadata about the file
     */
    static async associateFileWithClients(filePath, filename, fileType = 'crawled', metadata = {}) {
        try {
            console.log(`🔗 Associating file ${filename} with clients...`);

            // Get all active clients
            const clients = await Client.findAll({
                where: { isActive: true },
                include: [
                    {
                        model: ClientFile,
                        as: 'files',
                        where: { filename },
                        required: false
                    }
                ]
            });

            let associationsCreated = 0;

            for (const client of clients) {
                // Skip if file is already associated with this client
                if (client.files && client.files.length > 0) {
                    continue;
                }

                // Check if this file matches the client's requirements
                const matchScore = await this.calculateMatchScore(client, metadata);
                
                if (matchScore > 0) {
                    // Create association
                    await ClientFile.create({
                        clientId: client.id,
                        userId: client.userId,
                        filename,
                        filePath,
                        fileType,
                        title: metadata.title || filename,
                        description: metadata.description || `فایل مرتبط با نیازهای ${client.name}`,
                        matchScore,
                        metadata: {
                            ...metadata,
                            autoAssociated: true,
                            associatedAt: new Date()
                        },
                        isNew: true,
                        isRead: false
                    });

                    associationsCreated++;
                    console.log(`✅ Associated file ${filename} with client ${client.name} (score: ${matchScore}%)`);
                }
            }

            console.log(`🎯 Created ${associationsCreated} associations for file ${filename}`);
            return associationsCreated;

        } catch (error) {
            console.error('Error associating file with clients:', error);
            throw error;
        }
    }

    /**
     * Calculate match score between client requirements and file metadata
     * @param {Object} client - Client object
     * @param {Object} metadata - File metadata
     * @returns {number} Match score (0-100)
     */
    static async calculateMatchScore(client, metadata) {
        let score = 0;
        const factors = [];

        // Factor 1: Property type match (30 points)
        if (metadata.propertyType && metadata.propertyType === client.propertyType) {
            score += 30;
            factors.push('نوع ملک');
        }

        // Factor 2: City match (25 points)
        if (metadata.city && this.fuzzyMatch(metadata.city, client.city)) {
            score += 25;
            factors.push('شهر');
        }

        // Factor 3: Area match (20 points)
        if (metadata.area && client.area) {
            const areaMatch = this.checkAreaMatch(metadata.area, client.area);
            if (areaMatch > 0) {
                score += areaMatch * 20;
                factors.push('متراژ');
            }
        }

        // Factor 4: Budget match (15 points)
        if (metadata.price && client.budget) {
            const budgetMatch = this.checkBudgetMatch(metadata.price, client.budget);
            if (budgetMatch > 0) {
                score += budgetMatch * 15;
                factors.push('بودجه');
            }
        }

        // Factor 5: Neighborhood match (10 points)
        if (metadata.neighborhood && client.city) {
            // Check if neighborhood is in the same city
            const neighborhood = await Neighborhood.findOne({
                where: { 
                    name: { [Op.iLike]: `%${metadata.neighborhood}%` },
                    '$city.name$': { [Op.iLike]: `%${client.city}%` }
                },
                include: [{ model: City, as: 'city' }]
            });
            
            if (neighborhood) {
                score += 10;
                factors.push('محله');
            }
        }

        return Math.min(100, Math.round(score));
    }

    /**
     * Fuzzy string matching
     * @param {string} str1 - First string
     * @param {string} str2 - Second string
     * @returns {boolean} True if strings match
     */
    static fuzzyMatch(str1, str2) {
        if (!str1 || !str2) return false;
        
        const normalized1 = str1.toLowerCase().replace(/[^\u0600-\u06FF\w]/g, '');
        const normalized2 = str2.toLowerCase().replace(/[^\u0600-\u06FF\w]/g, '');
        
        return normalized1.includes(normalized2) || normalized2.includes(normalized1);
    }

    /**
     * Check if areas match
     * @param {string} fileArea - Area from file
     * @param {string} clientArea - Area from client
     * @returns {number} Match percentage (0-1)
     */
    static checkAreaMatch(fileArea, clientArea) {
        if (!fileArea || !clientArea) return 0;

        // Parse client area range
        const clientRange = this.parseAreaRange(clientArea);
        if (!clientRange) return 0;

        // Parse file area
        const fileValue = this.extractNumber(fileArea);
        if (!fileValue) return 0;

        // Check if file area is within client range
        if (fileValue >= clientRange.min && fileValue <= clientRange.max) {
            return 1;
        }

        // Check if it's close (within 20% of range)
        const range = clientRange.max - clientRange.min;
        const tolerance = range * 0.2;
        
        if (fileValue >= (clientRange.min - tolerance) && fileValue <= (clientRange.max + tolerance)) {
            return 0.5;
        }

        return 0;
    }

    /**
     * Check if budget matches
     * @param {string|number} filePrice - Price from file
     * @param {number} clientBudget - Budget from client
     * @returns {number} Match percentage (0-1)
     */
    static checkBudgetMatch(filePrice, clientBudget) {
        if (!filePrice || !clientBudget) return 0;

        const price = this.extractNumber(filePrice);
        if (!price) return 0;

        // Check if price is within budget (with 20% tolerance)
        const tolerance = clientBudget * 0.2;
        
        if (price <= clientBudget) {
            return 1;
        } else if (price <= (clientBudget + tolerance)) {
            return 0.5;
        }

        return 0;
    }

    /**
     * Parse area range from string
     * @param {string} areaString - Area string (e.g., "100-150", "120")
     * @returns {Object|null} Object with min and max values
     */
    static parseAreaRange(areaString) {
        if (!areaString) return null;
        
        const match = areaString.match(/(\d+)\s*-\s*(\d+)/);
        if (match) {
            return {
                min: parseInt(match[1]),
                max: parseInt(match[2])
            };
        }
        
        const singleMatch = areaString.match(/(\d+)/);
        if (singleMatch) {
            const value = parseInt(singleMatch[1]);
            return {
                min: Math.max(0, value - 20),
                max: value + 20
            };
        }
        
        return null;
    }

    /**
     * Extract number from string
     * @param {string} str - String containing number
     * @returns {number|null} Extracted number
     */
    static extractNumber(str) {
        if (!str) return null;
        
        const match = str.toString().match(/(\d+(?:,\d+)*)/);
        if (match) {
            return parseInt(match[1].replace(/,/g, ''));
        }
        
        return null;
    }

    /**
     * Get files for a specific client
     * @param {number} clientId - Client ID
     * @param {number} userId - User ID
     * @returns {Array} Array of client files
     */
    static async getClientFiles(clientId, userId) {
        return await ClientFile.findAll({
            where: { 
                clientId,
                userId 
            },
            order: [['createdAt', 'DESC']]
        });
    }

    /**
     * Get new files count for a client
     * @param {number} clientId - Client ID
     * @param {number} userId - User ID
     * @returns {number} Count of new files
     */
    static async getNewFilesCount(clientId, userId) {
        const count = await ClientFile.count({
            where: { 
                clientId,
                userId,
                isNew: true 
            }
        });
        return count;
    }

    /**
     * Mark file as read
     * @param {number} fileId - File ID
     * @param {number} clientId - Client ID
     * @param {number} userId - User ID
     * @returns {boolean} Success status
     */
    static async markFileAsRead(fileId, clientId, userId) {
        const file = await ClientFile.findOne({
            where: { 
                id: fileId,
                clientId,
                userId 
            }
        });

        if (!file) {
            throw new Error('File not found');
        }

        await file.update({
            isRead: true,
            isNew: false
        });

        return true;
    }
}

module.exports = ClientFileService; 