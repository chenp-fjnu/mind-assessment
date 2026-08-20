/**
 * SPM 题目数据（由 tools/gen-spm.js 重新生成，保证每题 6 个选项、答案唯一且符合图形规律）
 * 生成时间：2026-08-20T08:52:27.094Z
 * 题目数：60（A/B/C/D/E 各 12 题）
 * 图形结构：{ bg, shapes: [{ type, size, color, rotation, fill, count }] }
 * 约定：matrix 为 N×N，右下角单元格（最后一行最后一列）为空，需从 options 中补全。
 */
module.exports = [
  {
    "id": "SPM-001",
    "set": "A",
    "indexInSet": 1,
    "globalIndex": 1,
    "rule": "fill 沿列递进",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#d97706",
              "rotation": 180,
              "fill": "hollow",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#d97706",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#d97706",
              "rotation": 180,
              "fill": "hollow",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#d97706",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#d97706",
            "rotation": 180,
            "fill": "solid",
            "count": 2
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#1f2937",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#d97706",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#d97706",
            "rotation": 270,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#d97706",
            "rotation": 180,
            "fill": "hollow",
            "count": 1
          }
        ]
      }
    ],
    "answer": 3,
    "timeLimit": 40
  },
  {
    "id": "SPM-002",
    "set": "A",
    "indexInSet": 2,
    "globalIndex": 2,
    "rule": "rotation 沿行递进",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#1f2937",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#1f2937",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#1f2937",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#1f2937",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#1f2937",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#1f2937",
            "rotation": 270,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#1f2937",
            "rotation": 90,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#1f2937",
            "rotation": 90,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#1f2937",
            "rotation": 90,
            "fill": "solid",
            "count": 1
          }
        ]
      }
    ],
    "answer": 5,
    "timeLimit": 40
  },
  {
    "id": "SPM-003",
    "set": "A",
    "indexInSet": 3,
    "globalIndex": 3,
    "rule": "count 沿列递进",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#dc2626",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#dc2626",
              "rotation": 90,
              "fill": "solid",
              "count": 2
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#dc2626",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#dc2626",
            "rotation": 90,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#dc2626",
            "rotation": 0,
            "fill": "solid",
            "count": 2
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#dc2626",
            "rotation": 90,
            "fill": "solid",
            "count": 2
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#dc2626",
            "rotation": 90,
            "fill": "hollow",
            "count": 2
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#dc2626",
            "rotation": 90,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#dc2626",
            "rotation": 180,
            "fill": "solid",
            "count": 2
          }
        ]
      }
    ],
    "answer": 2,
    "timeLimit": 40
  },
  {
    "id": "SPM-004",
    "set": "A",
    "indexInSet": 4,
    "globalIndex": 4,
    "rule": "count 沿列递进",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#d97706",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#d97706",
              "rotation": 90,
              "fill": "solid",
              "count": 2
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#d97706",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#d97706",
            "rotation": 90,
            "fill": "hollow",
            "count": 2
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#d97706",
            "rotation": 270,
            "fill": "solid",
            "count": 2
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#d97706",
            "rotation": 90,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#d97706",
            "rotation": 90,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#d97706",
            "rotation": 90,
            "fill": "solid",
            "count": 2
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#d97706",
            "rotation": 0,
            "fill": "solid",
            "count": 2
          }
        ]
      }
    ],
    "answer": 4,
    "timeLimit": 40
  },
  {
    "id": "SPM-005",
    "set": "A",
    "indexInSet": 5,
    "globalIndex": 5,
    "rule": "shape 沿行递进",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#dc2626",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#dc2626",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#dc2626",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#dc2626",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#dc2626",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#dc2626",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#dc2626",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#dc2626",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#dc2626",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      }
    ],
    "answer": 1,
    "timeLimit": 40
  },
  {
    "id": "SPM-006",
    "set": "A",
    "indexInSet": 6,
    "globalIndex": 6,
    "rule": "rotation 沿列递进",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#1f2937",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#1f2937",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#1f2937",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#1f2937",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#1f2937",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#dc2626",
            "rotation": 90,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#1f2937",
            "rotation": 270,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#1f2937",
            "rotation": 90,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#1f2937",
            "rotation": 90,
            "fill": "solid",
            "count": 2
          }
        ]
      }
    ],
    "answer": 4,
    "timeLimit": 40
  },
  {
    "id": "SPM-007",
    "set": "A",
    "indexInSet": 7,
    "globalIndex": 7,
    "rule": "shape 沿列递进",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#16a34a",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#16a34a",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#16a34a",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#16a34a",
            "rotation": 90,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#16a34a",
            "rotation": 90,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#16a34a",
            "rotation": 90,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#16a34a",
            "rotation": 90,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#16a34a",
            "rotation": 90,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#16a34a",
            "rotation": 90,
            "fill": "solid",
            "count": 1
          }
        ]
      }
    ],
    "answer": 4,
    "timeLimit": 40
  },
  {
    "id": "SPM-008",
    "set": "A",
    "indexInSet": 8,
    "globalIndex": 8,
    "rule": "count 沿行递进",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#16a34a",
              "rotation": 270,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#16a34a",
              "rotation": 270,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#16a34a",
              "rotation": 270,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#16a34a",
            "rotation": 180,
            "fill": "solid",
            "count": 2
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#16a34a",
            "rotation": 270,
            "fill": "solid",
            "count": 2
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#16a34a",
            "rotation": 270,
            "fill": "hollow",
            "count": 2
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#16a34a",
            "rotation": 270,
            "fill": "solid",
            "count": 2
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#16a34a",
            "rotation": 270,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#16a34a",
            "rotation": 270,
            "fill": "solid",
            "count": 3
          }
        ]
      }
    ],
    "answer": 3,
    "timeLimit": 40
  },
  {
    "id": "SPM-009",
    "set": "A",
    "indexInSet": 9,
    "globalIndex": 9,
    "rule": "color 沿行递进",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#2563eb",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#2563eb",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#d97706",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#d97706",
            "rotation": 180,
            "fill": "solid",
            "count": 2
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#2563eb",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#d97706",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#16a34a",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#1f2937",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#dc2626",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      }
    ],
    "answer": 2,
    "timeLimit": 40
  },
  {
    "id": "SPM-010",
    "set": "A",
    "indexInSet": 10,
    "globalIndex": 10,
    "rule": "rotation 沿行递进",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#d97706",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#d97706",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#d97706",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#d97706",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#d97706",
            "rotation": 90,
            "fill": "hollow",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#d97706",
            "rotation": 270,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#d97706",
            "rotation": 90,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#d97706",
            "rotation": 90,
            "fill": "solid",
            "count": 2
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#d97706",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      }
    ],
    "answer": 3,
    "timeLimit": 40
  },
  {
    "id": "SPM-011",
    "set": "A",
    "indexInSet": 11,
    "globalIndex": 11,
    "rule": "color 沿列递进",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#2563eb",
              "rotation": 270,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#d97706",
              "rotation": 270,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#2563eb",
              "rotation": 270,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#dc2626",
            "rotation": 270,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#d97706",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#2563eb",
            "rotation": 270,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#d97706",
            "rotation": 270,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#1f2937",
            "rotation": 270,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#16a34a",
            "rotation": 270,
            "fill": "solid",
            "count": 1
          }
        ]
      }
    ],
    "answer": 3,
    "timeLimit": 40
  },
  {
    "id": "SPM-012",
    "set": "A",
    "indexInSet": 12,
    "globalIndex": 12,
    "rule": "fill 沿行递进",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#2563eb",
              "rotation": 90,
              "fill": "hollow",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#2563eb",
              "rotation": 90,
              "fill": "hollow",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#2563eb",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#2563eb",
            "rotation": 90,
            "fill": "hollow",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#1f2937",
            "rotation": 90,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#2563eb",
            "rotation": 90,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#2563eb",
            "rotation": 270,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#dc2626",
            "rotation": 90,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#2563eb",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      }
    ],
    "answer": 2,
    "timeLimit": 40
  },
  {
    "id": "SPM-013",
    "set": "B",
    "indexInSet": 1,
    "globalIndex": 13,
    "rule": "shape 沿行递进",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#2563eb",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#2563eb",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#2563eb",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#2563eb",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#2563eb",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#2563eb",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#2563eb",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#2563eb",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#2563eb",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#2563eb",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#2563eb",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#2563eb",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#2563eb",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#2563eb",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      }
    ],
    "answer": 4,
    "timeLimit": 40
  },
  {
    "id": "SPM-014",
    "set": "B",
    "indexInSet": 2,
    "globalIndex": 14,
    "rule": "rotation 沿列递进",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#dc2626",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#dc2626",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#dc2626",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#dc2626",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#dc2626",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#dc2626",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#dc2626",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#dc2626",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#d97706",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#dc2626",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#dc2626",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#dc2626",
            "rotation": 270,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#dc2626",
            "rotation": 90,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#dc2626",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      }
    ],
    "answer": 5,
    "timeLimit": 40
  },
  {
    "id": "SPM-015",
    "set": "B",
    "indexInSet": 3,
    "globalIndex": 15,
    "rule": "rotation 沿列递进",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#16a34a",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#16a34a",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#16a34a",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#16a34a",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#16a34a",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#16a34a",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#16a34a",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#16a34a",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#16a34a",
            "rotation": 90,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#16a34a",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#d97706",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#16a34a",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#16a34a",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#16a34a",
            "rotation": 270,
            "fill": "solid",
            "count": 1
          }
        ]
      }
    ],
    "answer": 3,
    "timeLimit": 40
  },
  {
    "id": "SPM-016",
    "set": "B",
    "indexInSet": 4,
    "globalIndex": 16,
    "rule": "shape 沿行递进",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#dc2626",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#dc2626",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#dc2626",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#dc2626",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#dc2626",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#dc2626",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#dc2626",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#dc2626",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#dc2626",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#dc2626",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#dc2626",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#dc2626",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#dc2626",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#dc2626",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      }
    ],
    "answer": 3,
    "timeLimit": 40
  },
  {
    "id": "SPM-017",
    "set": "B",
    "indexInSet": 5,
    "globalIndex": 17,
    "rule": "count 沿行递进",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#2563eb",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#2563eb",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#2563eb",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#2563eb",
              "rotation": 180,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#2563eb",
              "rotation": 180,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#2563eb",
              "rotation": 180,
              "fill": "solid",
              "count": 2
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#2563eb",
              "rotation": 180,
              "fill": "solid",
              "count": 3
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#2563eb",
              "rotation": 180,
              "fill": "solid",
              "count": 3
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#2563eb",
            "rotation": 180,
            "fill": "solid",
            "count": 2
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#1f2937",
            "rotation": 180,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#2563eb",
            "rotation": 180,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#2563eb",
            "rotation": 180,
            "fill": "hollow",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#2563eb",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#2563eb",
            "rotation": 180,
            "fill": "solid",
            "count": 3
          }
        ]
      }
    ],
    "answer": 2,
    "timeLimit": 40
  },
  {
    "id": "SPM-018",
    "set": "B",
    "indexInSet": 6,
    "globalIndex": 18,
    "rule": "rotation 沿列递进",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#d97706",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#d97706",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#d97706",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#d97706",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#d97706",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#d97706",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#d97706",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#d97706",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#d97706",
            "rotation": 180,
            "fill": "hollow",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#2563eb",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#d97706",
            "rotation": 90,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#d97706",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#d97706",
            "rotation": 270,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#d97706",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      }
    ],
    "answer": 3,
    "timeLimit": 40
  },
  {
    "id": "SPM-019",
    "set": "B",
    "indexInSet": 7,
    "globalIndex": 19,
    "rule": "count 沿列递进",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#2563eb",
              "rotation": 270,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#2563eb",
              "rotation": 270,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#2563eb",
              "rotation": 270,
              "fill": "solid",
              "count": 3
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#2563eb",
              "rotation": 270,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#2563eb",
              "rotation": 270,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#2563eb",
              "rotation": 270,
              "fill": "solid",
              "count": 3
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#2563eb",
              "rotation": 270,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#2563eb",
              "rotation": 270,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#2563eb",
            "rotation": 270,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#2563eb",
            "rotation": 90,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#2563eb",
            "rotation": 270,
            "fill": "hollow",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#dc2626",
            "rotation": 270,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#2563eb",
            "rotation": 270,
            "fill": "solid",
            "count": 2
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#2563eb",
            "rotation": 270,
            "fill": "solid",
            "count": 1
          }
        ]
      }
    ],
    "answer": 0,
    "timeLimit": 40
  },
  {
    "id": "SPM-020",
    "set": "B",
    "indexInSet": 8,
    "globalIndex": 20,
    "rule": "shape 沿列递进",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#d97706",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#d97706",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#d97706",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#d97706",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#d97706",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#d97706",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#d97706",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#d97706",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#d97706",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#d97706",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#d97706",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#d97706",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#d97706",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#d97706",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      }
    ],
    "answer": 3,
    "timeLimit": 40
  },
  {
    "id": "SPM-021",
    "set": "B",
    "indexInSet": 9,
    "globalIndex": 21,
    "rule": "shape 沿行递进",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#2563eb",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#2563eb",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#2563eb",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#2563eb",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#2563eb",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#2563eb",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#2563eb",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#2563eb",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#2563eb",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#2563eb",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#2563eb",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#2563eb",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#2563eb",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#2563eb",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      }
    ],
    "answer": 1,
    "timeLimit": 40
  },
  {
    "id": "SPM-022",
    "set": "B",
    "indexInSet": 10,
    "globalIndex": 22,
    "rule": "shape 沿列递进",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#dc2626",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#dc2626",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#dc2626",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#dc2626",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#dc2626",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#dc2626",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#dc2626",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#dc2626",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#dc2626",
            "rotation": 90,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#dc2626",
            "rotation": 90,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#dc2626",
            "rotation": 90,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#dc2626",
            "rotation": 90,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#dc2626",
            "rotation": 90,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#dc2626",
            "rotation": 90,
            "fill": "solid",
            "count": 1
          }
        ]
      }
    ],
    "answer": 3,
    "timeLimit": 40
  },
  {
    "id": "SPM-023",
    "set": "B",
    "indexInSet": 11,
    "globalIndex": 23,
    "rule": "shape 沿行递进",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#dc2626",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#dc2626",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#dc2626",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#dc2626",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#dc2626",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#dc2626",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#dc2626",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#dc2626",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#dc2626",
            "rotation": 90,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#dc2626",
            "rotation": 90,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#dc2626",
            "rotation": 90,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#dc2626",
            "rotation": 90,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#dc2626",
            "rotation": 90,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#dc2626",
            "rotation": 90,
            "fill": "solid",
            "count": 1
          }
        ]
      }
    ],
    "answer": 0,
    "timeLimit": 40
  },
  {
    "id": "SPM-024",
    "set": "B",
    "indexInSet": 12,
    "globalIndex": 24,
    "rule": "color 沿行递进",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#16a34a",
              "rotation": 270,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#16a34a",
              "rotation": 270,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#16a34a",
              "rotation": 270,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#2563eb",
              "rotation": 270,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#2563eb",
              "rotation": 270,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#2563eb",
              "rotation": 270,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#1f2937",
              "rotation": 270,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#1f2937",
              "rotation": 270,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#1f2937",
            "rotation": 270,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#16a34a",
            "rotation": 270,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#dc2626",
            "rotation": 270,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#1f2937",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#d97706",
            "rotation": 270,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#2563eb",
            "rotation": 270,
            "fill": "solid",
            "count": 1
          }
        ]
      }
    ],
    "answer": 0,
    "timeLimit": 40
  },
  {
    "id": "SPM-025",
    "set": "C",
    "indexInSet": 1,
    "globalIndex": 25,
    "rule": "shape(行)+count(列)",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#1f2937",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#1f2937",
              "rotation": 180,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#1f2937",
              "rotation": 180,
              "fill": "solid",
              "count": 3
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#1f2937",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#1f2937",
              "rotation": 180,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#1f2937",
              "rotation": 180,
              "fill": "solid",
              "count": 3
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#1f2937",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#1f2937",
              "rotation": 180,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#1f2937",
            "rotation": 180,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#1f2937",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#1f2937",
            "rotation": 180,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#1f2937",
            "rotation": 180,
            "fill": "solid",
            "count": 2
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#1f2937",
            "rotation": 180,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#1f2937",
            "rotation": 180,
            "fill": "solid",
            "count": 3
          }
        ]
      }
    ],
    "answer": 0,
    "timeLimit": 40
  },
  {
    "id": "SPM-026",
    "set": "C",
    "indexInSet": 2,
    "globalIndex": 26,
    "rule": "shape(行)+count(列)",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#1f2937",
              "rotation": 270,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#1f2937",
              "rotation": 270,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#1f2937",
              "rotation": 270,
              "fill": "solid",
              "count": 3
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#1f2937",
              "rotation": 270,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#1f2937",
              "rotation": 270,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#1f2937",
              "rotation": 270,
              "fill": "solid",
              "count": 3
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#1f2937",
              "rotation": 270,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#1f2937",
              "rotation": 270,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#1f2937",
            "rotation": 270,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#1f2937",
            "rotation": 270,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#1f2937",
            "rotation": 270,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#1f2937",
            "rotation": 270,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#1f2937",
            "rotation": 270,
            "fill": "solid",
            "count": 2
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#1f2937",
            "rotation": 270,
            "fill": "solid",
            "count": 3
          }
        ]
      }
    ],
    "answer": 1,
    "timeLimit": 40
  },
  {
    "id": "SPM-027",
    "set": "C",
    "indexInSet": 3,
    "globalIndex": 27,
    "rule": "rotation(列)+shape(行)",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#2563eb",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#2563eb",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#2563eb",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#2563eb",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#2563eb",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#2563eb",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#2563eb",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#2563eb",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#2563eb",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#2563eb",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#2563eb",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#2563eb",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#2563eb",
            "rotation": 270,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#2563eb",
            "rotation": 90,
            "fill": "solid",
            "count": 1
          }
        ]
      }
    ],
    "answer": 2,
    "timeLimit": 40
  },
  {
    "id": "SPM-028",
    "set": "C",
    "indexInSet": 4,
    "globalIndex": 28,
    "rule": "rotation(行)+shape(列)",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#2563eb",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#2563eb",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#2563eb",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#2563eb",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#2563eb",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#2563eb",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#2563eb",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#2563eb",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#2563eb",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#2563eb",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#2563eb",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#2563eb",
            "rotation": 90,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#2563eb",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#2563eb",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      }
    ],
    "answer": 1,
    "timeLimit": 40
  },
  {
    "id": "SPM-029",
    "set": "C",
    "indexInSet": 5,
    "globalIndex": 29,
    "rule": "shape(行)+color(列)",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#dc2626",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#1f2937",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#d97706",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#dc2626",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#1f2937",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#d97706",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#dc2626",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#1f2937",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#16a34a",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#d97706",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#2563eb",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#d97706",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#d97706",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#d97706",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      }
    ],
    "answer": 4,
    "timeLimit": 40
  },
  {
    "id": "SPM-030",
    "set": "C",
    "indexInSet": 6,
    "globalIndex": 30,
    "rule": "shape(行)+color(行)",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#1f2937",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#1f2937",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#1f2937",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#dc2626",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#dc2626",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#dc2626",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#16a34a",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#16a34a",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#16a34a",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#2563eb",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#16a34a",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#16a34a",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#16a34a",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#dc2626",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      }
    ],
    "answer": 4,
    "timeLimit": 40
  },
  {
    "id": "SPM-031",
    "set": "C",
    "indexInSet": 7,
    "globalIndex": 31,
    "rule": "rotation(列)+count(列)",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#dc2626",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#dc2626",
              "rotation": 90,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#dc2626",
              "rotation": 180,
              "fill": "solid",
              "count": 3
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#dc2626",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#dc2626",
              "rotation": 90,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#dc2626",
              "rotation": 180,
              "fill": "solid",
              "count": 3
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#dc2626",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#dc2626",
              "rotation": 90,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#dc2626",
            "rotation": 180,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#dc2626",
            "rotation": 270,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#dc2626",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#dc2626",
            "rotation": 0,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#dc2626",
            "rotation": 90,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#dc2626",
            "rotation": 180,
            "fill": "solid",
            "count": 2
          }
        ]
      }
    ],
    "answer": 0,
    "timeLimit": 40
  },
  {
    "id": "SPM-032",
    "set": "C",
    "indexInSet": 8,
    "globalIndex": 32,
    "rule": "count(行)+rotation(列)",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#d97706",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#d97706",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#d97706",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#d97706",
              "rotation": 0,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#d97706",
              "rotation": 90,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#d97706",
              "rotation": 180,
              "fill": "solid",
              "count": 2
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#d97706",
              "rotation": 0,
              "fill": "solid",
              "count": 3
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#d97706",
              "rotation": 90,
              "fill": "solid",
              "count": 3
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#d97706",
            "rotation": 270,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#d97706",
            "rotation": 180,
            "fill": "solid",
            "count": 2
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#d97706",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#d97706",
            "rotation": 90,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#d97706",
            "rotation": 180,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#d97706",
            "rotation": 0,
            "fill": "solid",
            "count": 3
          }
        ]
      }
    ],
    "answer": 4,
    "timeLimit": 40
  },
  {
    "id": "SPM-033",
    "set": "C",
    "indexInSet": 9,
    "globalIndex": 33,
    "rule": "rotation(列)+shape(列)",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#d97706",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#d97706",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#d97706",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#d97706",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#d97706",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#d97706",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#d97706",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#d97706",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#d97706",
            "rotation": 270,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#d97706",
            "rotation": 90,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#d97706",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#d97706",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#d97706",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#d97706",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      }
    ],
    "answer": 4,
    "timeLimit": 40
  },
  {
    "id": "SPM-034",
    "set": "C",
    "indexInSet": 10,
    "globalIndex": 34,
    "rule": "shape(行)+count(行)",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#d97706",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#d97706",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#d97706",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#d97706",
              "rotation": 180,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#d97706",
              "rotation": 180,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#d97706",
              "rotation": 180,
              "fill": "solid",
              "count": 2
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#d97706",
              "rotation": 180,
              "fill": "solid",
              "count": 3
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#d97706",
              "rotation": 180,
              "fill": "solid",
              "count": 3
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#d97706",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#d97706",
            "rotation": 180,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#d97706",
            "rotation": 180,
            "fill": "solid",
            "count": 2
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#d97706",
            "rotation": 180,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#d97706",
            "rotation": 180,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#d97706",
            "rotation": 180,
            "fill": "solid",
            "count": 3
          }
        ]
      }
    ],
    "answer": 1,
    "timeLimit": 40
  },
  {
    "id": "SPM-035",
    "set": "C",
    "indexInSet": 11,
    "globalIndex": 35,
    "rule": "rotation(行)+count(行)",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#dc2626",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#dc2626",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#dc2626",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#dc2626",
              "rotation": 90,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#dc2626",
              "rotation": 90,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#dc2626",
              "rotation": 90,
              "fill": "solid",
              "count": 2
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#dc2626",
              "rotation": 180,
              "fill": "solid",
              "count": 3
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#dc2626",
              "rotation": 180,
              "fill": "solid",
              "count": 3
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#dc2626",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#dc2626",
            "rotation": 180,
            "fill": "solid",
            "count": 2
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#dc2626",
            "rotation": 180,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#dc2626",
            "rotation": 270,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#dc2626",
            "rotation": 90,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#dc2626",
            "rotation": 0,
            "fill": "solid",
            "count": 3
          }
        ]
      }
    ],
    "answer": 2,
    "timeLimit": 40
  },
  {
    "id": "SPM-036",
    "set": "C",
    "indexInSet": 12,
    "globalIndex": 36,
    "rule": "count(列)+rotation(列)",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#1f2937",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#1f2937",
              "rotation": 90,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#1f2937",
              "rotation": 180,
              "fill": "solid",
              "count": 3
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#1f2937",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#1f2937",
              "rotation": 90,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#1f2937",
              "rotation": 180,
              "fill": "solid",
              "count": 3
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#1f2937",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#1f2937",
              "rotation": 90,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#1f2937",
            "rotation": 180,
            "fill": "solid",
            "count": 2
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#1f2937",
            "rotation": 90,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#1f2937",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#1f2937",
            "rotation": 270,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#1f2937",
            "rotation": 180,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#1f2937",
            "rotation": 0,
            "fill": "solid",
            "count": 3
          }
        ]
      }
    ],
    "answer": 4,
    "timeLimit": 40
  },
  {
    "id": "SPM-037",
    "set": "D",
    "indexInSet": 1,
    "globalIndex": 37,
    "rule": "rotation(列)+shape(行)",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#16a34a",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#16a34a",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#16a34a",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#16a34a",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#16a34a",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#16a34a",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#16a34a",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#16a34a",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#16a34a",
            "rotation": 90,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#16a34a",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#16a34a",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#16a34a",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#16a34a",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#16a34a",
            "rotation": 270,
            "fill": "solid",
            "count": 1
          }
        ]
      }
    ],
    "answer": 3,
    "timeLimit": 40
  },
  {
    "id": "SPM-038",
    "set": "D",
    "indexInSet": 2,
    "globalIndex": 38,
    "rule": "count(列)+rotation(行)",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#2563eb",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#2563eb",
              "rotation": 0,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#2563eb",
              "rotation": 0,
              "fill": "solid",
              "count": 3
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#2563eb",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#2563eb",
              "rotation": 90,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#2563eb",
              "rotation": 90,
              "fill": "solid",
              "count": 3
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#2563eb",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#2563eb",
              "rotation": 180,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#2563eb",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#2563eb",
            "rotation": 90,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#2563eb",
            "rotation": 180,
            "fill": "solid",
            "count": 2
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#2563eb",
            "rotation": 0,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#2563eb",
            "rotation": 180,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#2563eb",
            "rotation": 270,
            "fill": "solid",
            "count": 3
          }
        ]
      }
    ],
    "answer": 4,
    "timeLimit": 40
  },
  {
    "id": "SPM-039",
    "set": "D",
    "indexInSet": 3,
    "globalIndex": 39,
    "rule": "count(行)+color(列)",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#2563eb",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#dc2626",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#d97706",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#2563eb",
              "rotation": 0,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#dc2626",
              "rotation": 0,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#d97706",
              "rotation": 0,
              "fill": "solid",
              "count": 2
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#2563eb",
              "rotation": 0,
              "fill": "solid",
              "count": 3
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#dc2626",
              "rotation": 0,
              "fill": "solid",
              "count": 3
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#16a34a",
            "rotation": 0,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#d97706",
            "rotation": 0,
            "fill": "solid",
            "count": 2
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#d97706",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#2563eb",
            "rotation": 0,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#1f2937",
            "rotation": 0,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#d97706",
            "rotation": 0,
            "fill": "solid",
            "count": 3
          }
        ]
      }
    ],
    "answer": 5,
    "timeLimit": 40
  },
  {
    "id": "SPM-040",
    "set": "D",
    "indexInSet": 4,
    "globalIndex": 40,
    "rule": "count(行)+shape(列)",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#2563eb",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#2563eb",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#2563eb",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#2563eb",
              "rotation": 180,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#2563eb",
              "rotation": 180,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#2563eb",
              "rotation": 180,
              "fill": "solid",
              "count": 2
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#2563eb",
              "rotation": 180,
              "fill": "solid",
              "count": 3
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#2563eb",
              "rotation": 180,
              "fill": "solid",
              "count": 3
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#2563eb",
            "rotation": 180,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#2563eb",
            "rotation": 180,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#2563eb",
            "rotation": 180,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#2563eb",
            "rotation": 180,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#2563eb",
            "rotation": 180,
            "fill": "solid",
            "count": 2
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#2563eb",
            "rotation": 180,
            "fill": "solid",
            "count": 3
          }
        ]
      }
    ],
    "answer": 5,
    "timeLimit": 40
  },
  {
    "id": "SPM-041",
    "set": "D",
    "indexInSet": 5,
    "globalIndex": 41,
    "rule": "color(行)+count(行)",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#d97706",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#d97706",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#d97706",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#16a34a",
              "rotation": 0,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#16a34a",
              "rotation": 0,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#16a34a",
              "rotation": 0,
              "fill": "solid",
              "count": 2
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#dc2626",
              "rotation": 0,
              "fill": "solid",
              "count": 3
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#dc2626",
              "rotation": 0,
              "fill": "solid",
              "count": 3
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#2563eb",
            "rotation": 0,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#dc2626",
            "rotation": 0,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#dc2626",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#d97706",
            "rotation": 0,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#16a34a",
            "rotation": 0,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#1f2937",
            "rotation": 0,
            "fill": "solid",
            "count": 3
          }
        ]
      }
    ],
    "answer": 1,
    "timeLimit": 40
  },
  {
    "id": "SPM-042",
    "set": "D",
    "indexInSet": 6,
    "globalIndex": 42,
    "rule": "color(列)+rotation(行)",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#16a34a",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#dc2626",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#2563eb",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#16a34a",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#dc2626",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#2563eb",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#16a34a",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#dc2626",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#2563eb",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#2563eb",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#2563eb",
            "rotation": 90,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#1f2937",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#16a34a",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#2563eb",
            "rotation": 270,
            "fill": "solid",
            "count": 1
          }
        ]
      }
    ],
    "answer": 0,
    "timeLimit": 40
  },
  {
    "id": "SPM-043",
    "set": "D",
    "indexInSet": 7,
    "globalIndex": 43,
    "rule": "shape(列)+color(行)",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#2563eb",
              "rotation": 270,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#2563eb",
              "rotation": 270,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#2563eb",
              "rotation": 270,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#d97706",
              "rotation": 270,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#d97706",
              "rotation": 270,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#d97706",
              "rotation": 270,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#1f2937",
              "rotation": 270,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#1f2937",
              "rotation": 270,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#d97706",
            "rotation": 270,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#1f2937",
            "rotation": 270,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#1f2937",
            "rotation": 270,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#2563eb",
            "rotation": 270,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#1f2937",
            "rotation": 270,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#1f2937",
            "rotation": 270,
            "fill": "solid",
            "count": 1
          }
        ]
      }
    ],
    "answer": 5,
    "timeLimit": 40
  },
  {
    "id": "SPM-044",
    "set": "D",
    "indexInSet": 8,
    "globalIndex": 44,
    "rule": "rotation(行)+color(列)",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#1f2937",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#16a34a",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#dc2626",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#1f2937",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#16a34a",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#dc2626",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#1f2937",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#16a34a",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#dc2626",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#dc2626",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#dc2626",
            "rotation": 270,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#16a34a",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#1f2937",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#2563eb",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      }
    ],
    "answer": 0,
    "timeLimit": 40
  },
  {
    "id": "SPM-045",
    "set": "D",
    "indexInSet": 9,
    "globalIndex": 45,
    "rule": "rotation(行)+shape(列)",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#dc2626",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#dc2626",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#dc2626",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#dc2626",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#dc2626",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#dc2626",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#dc2626",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#dc2626",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#dc2626",
            "rotation": 270,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#dc2626",
            "rotation": 90,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#dc2626",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#dc2626",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#dc2626",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#dc2626",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      }
    ],
    "answer": 4,
    "timeLimit": 40
  },
  {
    "id": "SPM-046",
    "set": "D",
    "indexInSet": 10,
    "globalIndex": 46,
    "rule": "color(行)+count(列)",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#16a34a",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#16a34a",
              "rotation": 0,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#16a34a",
              "rotation": 0,
              "fill": "solid",
              "count": 3
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#d97706",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#d97706",
              "rotation": 0,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#d97706",
              "rotation": 0,
              "fill": "solid",
              "count": 3
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#1f2937",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#1f2937",
              "rotation": 0,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#1f2937",
            "rotation": 0,
            "fill": "solid",
            "count": 2
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#1f2937",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#dc2626",
            "rotation": 0,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#16a34a",
            "rotation": 0,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#1f2937",
            "rotation": 0,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#2563eb",
            "rotation": 0,
            "fill": "solid",
            "count": 3
          }
        ]
      }
    ],
    "answer": 4,
    "timeLimit": 40
  },
  {
    "id": "SPM-047",
    "set": "D",
    "indexInSet": 11,
    "globalIndex": 47,
    "rule": "shape(行)+color(行)",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#1f2937",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#1f2937",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#1f2937",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#16a34a",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#16a34a",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#16a34a",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#dc2626",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#dc2626",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#dc2626",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#dc2626",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#dc2626",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#16a34a",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#dc2626",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#d97706",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      }
    ],
    "answer": 0,
    "timeLimit": 40
  },
  {
    "id": "SPM-048",
    "set": "D",
    "indexInSet": 12,
    "globalIndex": 48,
    "rule": "count(列)+shape(行)",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#16a34a",
              "rotation": 270,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#16a34a",
              "rotation": 270,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#16a34a",
              "rotation": 270,
              "fill": "solid",
              "count": 3
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#16a34a",
              "rotation": 270,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#16a34a",
              "rotation": 270,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#16a34a",
              "rotation": 270,
              "fill": "solid",
              "count": 3
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#16a34a",
              "rotation": 270,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#16a34a",
              "rotation": 270,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#16a34a",
            "rotation": 270,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#16a34a",
            "rotation": 270,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#16a34a",
            "rotation": 270,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#16a34a",
            "rotation": 270,
            "fill": "solid",
            "count": 2
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#16a34a",
            "rotation": 270,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#16a34a",
            "rotation": 270,
            "fill": "solid",
            "count": 3
          }
        ]
      }
    ],
    "answer": 0,
    "timeLimit": 40
  },
  {
    "id": "SPM-049",
    "set": "E",
    "indexInSet": 1,
    "globalIndex": 49,
    "rule": "count(行)+color(列)",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#1f2937",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#2563eb",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#16a34a",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#1f2937",
              "rotation": 0,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#2563eb",
              "rotation": 0,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#16a34a",
              "rotation": 0,
              "fill": "solid",
              "count": 2
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#1f2937",
              "rotation": 0,
              "fill": "solid",
              "count": 3
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#2563eb",
              "rotation": 0,
              "fill": "solid",
              "count": 3
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#16a34a",
            "rotation": 0,
            "fill": "solid",
            "count": 2
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#16a34a",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#1f2937",
            "rotation": 0,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#2563eb",
            "rotation": 0,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#dc2626",
            "rotation": 0,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#16a34a",
            "rotation": 0,
            "fill": "solid",
            "count": 3
          }
        ]
      }
    ],
    "answer": 5,
    "timeLimit": 40
  },
  {
    "id": "SPM-050",
    "set": "E",
    "indexInSet": 2,
    "globalIndex": 50,
    "rule": "rotation(行)+count(列)",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#16a34a",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#16a34a",
              "rotation": 0,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#16a34a",
              "rotation": 0,
              "fill": "solid",
              "count": 3
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#16a34a",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#16a34a",
              "rotation": 90,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#16a34a",
              "rotation": 90,
              "fill": "solid",
              "count": 3
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#16a34a",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#16a34a",
              "rotation": 180,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#16a34a",
            "rotation": 180,
            "fill": "solid",
            "count": 2
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#16a34a",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#16a34a",
            "rotation": 180,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#16a34a",
            "rotation": 0,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#16a34a",
            "rotation": 90,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#16a34a",
            "rotation": 270,
            "fill": "solid",
            "count": 3
          }
        ]
      }
    ],
    "answer": 2,
    "timeLimit": 40
  },
  {
    "id": "SPM-051",
    "set": "E",
    "indexInSet": 3,
    "globalIndex": 51,
    "rule": "color(行)+count(列)",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#16a34a",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#16a34a",
              "rotation": 0,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#16a34a",
              "rotation": 0,
              "fill": "solid",
              "count": 3
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#2563eb",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#2563eb",
              "rotation": 0,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#2563eb",
              "rotation": 0,
              "fill": "solid",
              "count": 3
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#d97706",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#d97706",
              "rotation": 0,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#d97706",
            "rotation": 0,
            "fill": "solid",
            "count": 2
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#1f2937",
            "rotation": 0,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#dc2626",
            "rotation": 0,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#d97706",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#d97706",
            "rotation": 0,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#16a34a",
            "rotation": 0,
            "fill": "solid",
            "count": 3
          }
        ]
      }
    ],
    "answer": 4,
    "timeLimit": 40
  },
  {
    "id": "SPM-052",
    "set": "E",
    "indexInSet": 4,
    "globalIndex": 52,
    "rule": "count(行)+rotation(列)",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#16a34a",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#16a34a",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#16a34a",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#16a34a",
              "rotation": 0,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#16a34a",
              "rotation": 90,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#16a34a",
              "rotation": 180,
              "fill": "solid",
              "count": 2
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#16a34a",
              "rotation": 0,
              "fill": "solid",
              "count": 3
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#16a34a",
              "rotation": 90,
              "fill": "solid",
              "count": 3
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#16a34a",
            "rotation": 180,
            "fill": "solid",
            "count": 2
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#16a34a",
            "rotation": 90,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#16a34a",
            "rotation": 180,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#16a34a",
            "rotation": 270,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#16a34a",
            "rotation": 0,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#16a34a",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      }
    ],
    "answer": 2,
    "timeLimit": 40
  },
  {
    "id": "SPM-053",
    "set": "E",
    "indexInSet": 5,
    "globalIndex": 53,
    "rule": "rotation(行)+shape(列)",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#16a34a",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#16a34a",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#16a34a",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#16a34a",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#16a34a",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#16a34a",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#16a34a",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#16a34a",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#16a34a",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#16a34a",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#16a34a",
            "rotation": 90,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#16a34a",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#16a34a",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#16a34a",
            "rotation": 270,
            "fill": "solid",
            "count": 1
          }
        ]
      }
    ],
    "answer": 4,
    "timeLimit": 40
  },
  {
    "id": "SPM-054",
    "set": "E",
    "indexInSet": 6,
    "globalIndex": 54,
    "rule": "rotation(行)+shape(列)",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#1f2937",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#1f2937",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#1f2937",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#1f2937",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#1f2937",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#1f2937",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#1f2937",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#1f2937",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#1f2937",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#1f2937",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#1f2937",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#1f2937",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#1f2937",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#1f2937",
            "rotation": 90,
            "fill": "solid",
            "count": 1
          }
        ]
      }
    ],
    "answer": 1,
    "timeLimit": 40
  },
  {
    "id": "SPM-055",
    "set": "E",
    "indexInSet": 7,
    "globalIndex": 55,
    "rule": "count(行)+color(列)",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#dc2626",
              "rotation": 270,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#2563eb",
              "rotation": 270,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#16a34a",
              "rotation": 270,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#dc2626",
              "rotation": 270,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#2563eb",
              "rotation": 270,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#16a34a",
              "rotation": 270,
              "fill": "solid",
              "count": 2
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#dc2626",
              "rotation": 270,
              "fill": "solid",
              "count": 3
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#2563eb",
              "rotation": 270,
              "fill": "solid",
              "count": 3
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#1f2937",
            "rotation": 270,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#16a34a",
            "rotation": 270,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#2563eb",
            "rotation": 270,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#16a34a",
            "rotation": 270,
            "fill": "solid",
            "count": 2
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#d97706",
            "rotation": 270,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#16a34a",
            "rotation": 270,
            "fill": "solid",
            "count": 1
          }
        ]
      }
    ],
    "answer": 1,
    "timeLimit": 40
  },
  {
    "id": "SPM-056",
    "set": "E",
    "indexInSet": 8,
    "globalIndex": 56,
    "rule": "count(行)+rotation(列)",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#2563eb",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#2563eb",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#2563eb",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#2563eb",
              "rotation": 0,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#2563eb",
              "rotation": 90,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#2563eb",
              "rotation": 180,
              "fill": "solid",
              "count": 2
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#2563eb",
              "rotation": 0,
              "fill": "solid",
              "count": 3
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "triangle",
              "size": 80,
              "color": "#2563eb",
              "rotation": 90,
              "fill": "solid",
              "count": 3
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#2563eb",
            "rotation": 180,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#2563eb",
            "rotation": 0,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#2563eb",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#2563eb",
            "rotation": 90,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#2563eb",
            "rotation": 270,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#2563eb",
            "rotation": 180,
            "fill": "solid",
            "count": 2
          }
        ]
      }
    ],
    "answer": 0,
    "timeLimit": 40
  },
  {
    "id": "SPM-057",
    "set": "E",
    "indexInSet": 9,
    "globalIndex": 57,
    "rule": "shape(行)+color(列)",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#dc2626",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#d97706",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#1f2937",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#dc2626",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#d97706",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#1f2937",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#dc2626",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#d97706",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#2563eb",
            "rotation": 90,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#1f2937",
            "rotation": 90,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#1f2937",
            "rotation": 90,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#1f2937",
            "rotation": 90,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#16a34a",
            "rotation": 90,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#dc2626",
            "rotation": 90,
            "fill": "solid",
            "count": 1
          }
        ]
      }
    ],
    "answer": 1,
    "timeLimit": 40
  },
  {
    "id": "SPM-058",
    "set": "E",
    "indexInSet": 10,
    "globalIndex": 58,
    "rule": "rotation(行)+shape(列)",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#1f2937",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#1f2937",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#1f2937",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#1f2937",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#1f2937",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "star",
              "size": 80,
              "color": "#1f2937",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "circle",
              "size": 80,
              "color": "#1f2937",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "diamond",
              "size": 80,
              "color": "#1f2937",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "diamond",
            "size": 80,
            "color": "#1f2937",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#1f2937",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#1f2937",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "triangle",
            "size": 80,
            "color": "#1f2937",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "circle",
            "size": 80,
            "color": "#1f2937",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "star",
            "size": 80,
            "color": "#1f2937",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      }
    ],
    "answer": 1,
    "timeLimit": 40
  },
  {
    "id": "SPM-059",
    "set": "E",
    "indexInSet": 11,
    "globalIndex": 59,
    "rule": "count(行)+color(列)",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#dc2626",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#2563eb",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#16a34a",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#dc2626",
              "rotation": 180,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#2563eb",
              "rotation": 180,
              "fill": "solid",
              "count": 2
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#16a34a",
              "rotation": 180,
              "fill": "solid",
              "count": 2
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#dc2626",
              "rotation": 180,
              "fill": "solid",
              "count": 3
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "hexagon",
              "size": 80,
              "color": "#2563eb",
              "rotation": 180,
              "fill": "solid",
              "count": 3
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#d97706",
            "rotation": 180,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#16a34a",
            "rotation": 180,
            "fill": "solid",
            "count": 2
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#16a34a",
            "rotation": 180,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#16a34a",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#2563eb",
            "rotation": 180,
            "fill": "solid",
            "count": 3
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "hexagon",
            "size": 80,
            "color": "#1f2937",
            "rotation": 180,
            "fill": "solid",
            "count": 3
          }
        ]
      }
    ],
    "answer": 2,
    "timeLimit": 40
  },
  {
    "id": "SPM-060",
    "set": "E",
    "indexInSet": 12,
    "globalIndex": 60,
    "rule": "color(行)+rotation(列)",
    "matrix": [
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#16a34a",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#16a34a",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#16a34a",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#1f2937",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#1f2937",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#1f2937",
              "rotation": 180,
              "fill": "solid",
              "count": 1
            }
          ]
        }
      ],
      [
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#d97706",
              "rotation": 0,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": [
            {
              "type": "square",
              "size": 80,
              "color": "#d97706",
              "rotation": 90,
              "fill": "solid",
              "count": 1
            }
          ]
        },
        {
          "bg": null,
          "shapes": []
        }
      ]
    ],
    "options": [
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#d97706",
            "rotation": 270,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#2563eb",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#d97706",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#d97706",
            "rotation": 0,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#1f2937",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      },
      {
        "bg": null,
        "shapes": [
          {
            "type": "square",
            "size": 80,
            "color": "#16a34a",
            "rotation": 180,
            "fill": "solid",
            "count": 1
          }
        ]
      }
    ],
    "answer": 2,
    "timeLimit": 40
  }
]
