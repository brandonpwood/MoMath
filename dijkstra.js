/* MoMath Math Square Behavior
*   Title: Dijkstra's Chase
*   Description: Generates a random maze then races the user against Dijkstra's Algorithm.
*   Author: Bradon Wood
*   Created: 8/5/2017
*   Status: Work in progress.
*/


//    CUSTOM FUNCTIONS

import P5Behavior from 'p5beh';

class persistance{}; 

function make_grid(){
    var nodes = [];
    var edges = [];
    for(var y = 0; y < 576; y += 72){
      for(var x = 0; x < 576; x += 72){
          var node = [x, y];
          nodes.push(node);
          if(x > 0){ edges.push([node, nodes[nodes.length - 2]]) }
          if(y > 0){ edges.push([node, nodes[nodes.length - 9]]) }
      }
    }
    var G = [nodes, edges];

    return G;
}

function draw_progress(p, edge){
     // Paint it white.
    p.fill('#ffffff');
    p.stroke('#ffffff');

    p.ellipse(edge[0][0] + 36, edge[0][1] + 36, 18, 18);
    p.ellipse(edge[1][0]+ 36, edge[1][1] + 36, 18, 18);
    p.line(edge[0][0] + 36, edge[0][1] + 36, edge[1][0]+ 36, edge[1][1] + 36);
}

function update(p, node, css){
    p.fill(css);
    p.ellipse(node[0] + 36, node[1] + 36, 18, 18);
}

function random_choice(arr){
    return arr[Math.floor(Math.random() * (arr.length - 1) )];
}

function arraysEqual(arr1, arr2) {
    if(arr1.length !== arr2.length)
        return false;
    for(var i = arr1.length; i--;) {
        if(arr1[i] !== arr2[i])
            return false;
    }

    return true;
}

function arrayContainsArray(arr1, arr2){
   for(var i = 0; i < arr1.length; i ++){
        if(arraysEqual(arr1[i], arr2)){
            return true;
        }
    }
    return false;
}

function find_neighbors(G, node){
    var neighbors  = [];
    G[1].forEach(function(edge){
        if(arrayContainsArray(edge, node)){
            if(arraysEqual(edge[0], node)){
                neighbors.push(edge[1])
            }else{
                neighbors.push(edge[0]);
            }
        };
    });
    return neighbors;
} 

function vet_neighbors(unvisited, neighbors){
    var fresh = [];
    for(var i = 0; i < neighbors.length; i ++){
        if(arrayContainsArray(unvisited, neighbors[i])){
            fresh.push(neighbors[i]);
        }
    }
    return fresh;
}

function make_maze(G){
    // Storage variables.
    var stack  = [];
    var new_edges = [];
    var path = [];
    // Basis for algorithm.
    var unvisited = G[0].slice();
    var current_node = G[0][Math.floor(Math.random()*G[0].length)];
    
    while(unvisited.length > 0){
        path.push(current_node);

        var neighbors = vet_neighbors(unvisited, find_neighbors(G, current_node)); 
        
        // If there are new neighbors, update to one. Else, refer to stack.
        if(neighbors.length > 0){
            var new_node = neighbors[Math.floor(Math.random()*neighbors.length)];
            unvisited.splice(unvisited.indexOf(new_node), 1);
            stack.push(current_node);
            new_edges.push([current_node, new_node]);
            current_node = new_node;
        }
        else{
            current_node = stack.pop(); 
        }
    }

    return [new_edges, path];
}

function generateMaze(p, G){
    var G = make_grid();
    var maze = make_maze(G);
    var edges = maze[0];
    var path = maze[1];
    make_maze(G)[0].forEach(function(edge){
        edges.push(edge);
    });
    edges.forEach(function(edge){
        draw_progress(p, edge);
    });
    maze.push(G);
    return maze
}

// function dijkstra (G, start, stop){
//     var path = [];
//     var adjacent = [];
    
//     // Effectively infinite cost.
//     G[0].forEach(function(node){
//         node.push(1000000);
//     });
//     stop.push(1000000);
//     start.push(0);
//     current_node = start;

//     while(!arraysEqual(current_node, stop)){
//         var neighbors = find_neighbors(G, current_node);
        
//         // Update costs
//         neighbors.forEach(function(node){
//             if (current_node[2] + 1 < node[2]){
//                 node[2] =  current_node[2] + 1;
//             }
//         });
//         fresh = []
//         // Ignore already visited.
//         neighbors.forEach(function(node){
//             if(arrayContainsArray(visited, node)){
//                 fresh.push(node);
//             }
//         });
//         // Add to consideration list.
//         fresh.forEach(function(node){
//             adjacent.push(node);
//         });

//         min = adjacent[0];
//         adjacent.forEach(function(node){
//             if(node[2] <  min[2]){
//                 min = node
//             }
//         });
//         path.push(min);
//         visited.push(current_node);
//         current_node =  min;
//     }
//     return path;
// }

function Astar (G, start, stop){
};

// RUNNING AND EXPORTS

const pb = new P5Behavior();

pb.preload = function (p) {
  /* this == pb.p5 == p */
}

pb.setup = function (p) {
    var m = generateMaze(p, make_grid());
    var edges = m[0];
    var path = m[1];
    var graph = m[2];
    

    // Pick final node.
    var goal = path[Math.floor(Math.random()*path.length)];
    while(arraysEqual(goal, path[0])){
        var goal = path[Math.floor(Math.random()*path.length)];
    }

    // Draw final and initial.
    update(p, path[0], '#228B22'); // Red for start.
    update(p, goal, '#8B0000'); // Green for end.
    
    // Store for later.
    persistance.neighbors = find_neighbors(graph, path[0]); 
    // persistance.dijkstra = dijkstra(G, path[0], goal);
    persistance.path = path;
    persistance.graph = graph;
    persistance.edges = edges;
    persistance.goal = goal;
    persistance.counter = 0;
    console.log(persistance.neighbors);
}

pb.draw = function (floor, p) {
    persistance.neighbors.forEach(function(node){
        floor.users.forEach(function(user){
            if((node[0] + 72>  user.x &&  user.x > node[0]) && (node[1] + 72> user.y && user.y > node[1]) ){
                find_neighbors(persistance.graph, node).forEach(function(node2){
                    persistance.neighbors.push(node2);
                });
                persistance.neighbors.splice(persistance.neighbors.indexOf(node), 1);
                persistance.counter += 1;
                if(arraysEqual(node, persistance.path[persistance.counter])){
                    if(arraysEqual(node, persistance.goal)){
                        p.clear();
                        p.textSize(40);
                        p.text("It's a Tie!", 250, 250);                            
                    }else{
                        update(p, node, '#8B008B'); // Purple for when they land on the same node.
                    }
                }
                else if(arraysEqual(node, persistance.goal)){
                    p.clear();
                    p.textSize(40);
                    p.text("You've won!!", 250, 250);                            
                }
                else if(arraysEqual(persistance.path[persistance.counter], persistance.goal)){
                    p.clear();
                    p.textSize(40);
                    p.text("You've lost!!", 250, 250);                                   
                }
                else{
                    update(p, node, '#228B22');
                    update(p, persistance.path[persistance.counter], '#00CED1');
                }
            }
        });
    });
}


export const behavior = {
  title: "Dijkstra's Chase",
  init: pb.init.bind(pb),
  frameRate: 'sensors',
  render: pb.render.bind(pb)
}
export default behavior
