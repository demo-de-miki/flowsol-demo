export const IDL = {
  version: "0.1.0",
  name: "flowsol",
  instructions: [
    {
      name: "createStream",
      accounts: [
        {
          name: "stream",
          isMut: true,
          isSigner: false
        },
        {
          name: "sender",
          isMut: true,
          isSigner: true
        },
        {
          name: "receiver",
          isMut: false,
          isSigner: false
        },
        {
          name: "senderTokenAccount",
          isMut: true,
          isSigner: false
        },
        {
          name: "streamTokenAccount",
          isMut: true,
          isSigner: false
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: "ratePerSecond",
          type: "u64"
        },
        {
          name: "amount",
          type: "u64"
        }
      ]
    },
    {
      name: "withdraw",
      accounts: [
        {
          name: "stream",
          isMut: true,
          isSigner: false
        },
        {
          name: "receiver",
          isMut: false,
          isSigner: true
        },
        {
          name: "streamTokenAccount",
          isMut: true,
          isSigner: false
        },
        {
          name: "receiverTokenAccount",
          isMut: true,
          isSigner: false
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    },
    {
      name: "closeStream",
      accounts: [
        {
          name: "stream",
          isMut: true,
          isSigner: false
        },
        {
          name: "sender",
          isMut: false,
          isSigner: true
        },
        {
          name: "streamTokenAccount",
          isMut: true,
          isSigner: false
        },
        {
          name: "senderTokenAccount",
          isMut: true,
          isSigner: false
        },
        {
          name: "receiverTokenAccount",
          isMut: true,
          isSigner: false
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    }
  ],
  accounts: [
    {
      name: "StreamAccount",
      type: {
        kind: "struct",
        fields: [
          {
            name: "sender",
            type: "publicKey"
          },
          {
            name: "receiver",
            type: "publicKey"
          },
          {
            name: "ratePerSecond",
            type: "u64"
          },
          {
            name: "startTime",
            type: "i64"
          },
          {
            name: "lastWithdrawal",
            type: "i64"
          },
          {
            name: "totalDeposited",
            type: "u64"
          },
          {
            name: "totalWithdrawn",
            type: "u64"
          },
          {
            name: "isActive",
            type: "bool"
          }
        ]
      }
    }
  ],
  errors: [
    {
      code: 6000,
      name: "StreamNotActive",
      msg: "Stream is not active"
    },
    {
      code: 6001,
      name: "UnauthorizedWithdrawal",
      msg: "Unauthorized withdrawal"
    },
    {
      code: 6002,
      name: "NothingToWithdraw",
      msg: "Nothing to withdraw"
    },
    {
      code: 6003,
      name: "UnauthorizedClose",
      msg: "Unauthorized close"
    }
  ]
};

export const PROGRAM_ID = "11111111111111111111111111111112";
