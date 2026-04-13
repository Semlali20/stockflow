package com.stock.authservice.util;

import java.io.FileOutputStream;
import java.io.IOException;
import java.security.*;
import java.util.Base64;

public class KeyGenerator {

    public static void main(String[] args) {
        try {
            System.out.println("🔑 Generating RSA Key Pair...");

            // Generate RSA key pair
            KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
            keyPairGenerator.initialize(2048);
            KeyPair keyPair = keyPairGenerator.generateKeyPair();

            PrivateKey privateKey = keyPair.getPrivate();
            PublicKey publicKey = keyPair.getPublic();

            // Create keys directory if it doesn't exist
            java.io.File keysDir = new java.io.File("src/main/resources/keys");
            if (!keysDir.exists()) {
                keysDir.mkdirs();
                System.out.println("📁 Created directory: src/main/resources/keys");
            }

            // Save private key in PEM format
            String privateKeyPEM = convertToPEM(privateKey.getEncoded(), "PRIVATE KEY");
            saveToFile("src/main/resources/keys/private_key.pem", privateKeyPEM);
            System.out.println("✅ Private key saved to: src/main/resources/keys/private_key.pem");

            // Save public key in PEM format
            String publicKeyPEM = convertToPEM(publicKey.getEncoded(), "PUBLIC KEY");
            saveToFile("src/main/resources/keys/public_key.pem", publicKeyPEM);
            System.out.println("✅ Public key saved to: src/main/resources/keys/public_key.pem");

            System.out.println("\n========================================");
            System.out.println("🎉 Keys Generated Successfully!");
            System.out.println("========================================");

            System.out.println("\n📄 Private Key Preview (first 100 chars):");
            System.out.println(privateKeyPEM.substring(0, Math.min(100, privateKeyPEM.length())) + "...");

            System.out.println("\n📄 Public Key Preview (first 100 chars):");
            System.out.println(publicKeyPEM.substring(0, Math.min(100, publicKeyPEM.length())) + "...");

            System.out.println("\n⚠️  IMPORTANT SECURITY NOTICE:");
            System.out.println("   Add 'src/main/resources/keys/private_key.pem' to your .gitignore!");
            System.out.println("   NEVER commit the private key to Git!");

        } catch (Exception e) {
            System.err.println("❌ Error generating keys: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private static String convertToPEM(byte[] keyBytes, String type) {
        String base64Encoded = Base64.getEncoder().encodeToString(keyBytes);

        StringBuilder pem = new StringBuilder();
        pem.append("-----BEGIN ").append(type).append("-----\n");

        // Split into 64-character lines
        int index = 0;
        while (index < base64Encoded.length()) {
            pem.append(base64Encoded, index, Math.min(index + 64, base64Encoded.length()));
            pem.append("\n");
            index += 64;
        }

        pem.append("-----END ").append(type).append("-----\n");
        return pem.toString();
    }

    private static void saveToFile(String filename, String content) throws IOException {
        try (FileOutputStream fos = new FileOutputStream(filename)) {
            fos.write(content.getBytes());
        }
    }
}
